"""Minimal HTTP wrapper for VERSE_MODE graphic generation (motif + flat mockup).

Contract (see apps/web/src/lib/providers/graphic/remote.ts and diffusersAdapter.ts):
    POST /v1/motif        {seed, prompt, motif?, palette, placement, checkpoint, modelVersion?}
    POST /v1/flat-mockup  {seed, garmentFamily, colour?, placement, artworkBase64?, artworkMimeType?,
                           checkpoint, modelVersion?}
    -> {imageBase64, mimeType: image/png, modelName, modelVersion, modelLicense, outputLicense,
        requestId, isSimulation, notice?}
    GET /health

NOTE: the client accepts only png/jpeg/webp responses (no SVG), so all placeholders are PNG.
NOTE: the client derives its own isSimulation flag from the request kind and ignores ours; placeholders
are therefore identified by modelName "verse-sandbox-placeholder". Set DIFFUSERS_REJECT_PLACEHOLDER=1 on
production deployments so placeholders can never be mistaken for real renders.

Safety: no URL fetching, capped body/base64/pixels, worker-thread timeout, single-flight GPU lock,
`checkpoint` is a label only, model weights are loaded from the local cache unless DIFFUSERS_ALLOW_DOWNLOAD=1.

Environment:
  DIFFUSERS_API_TOKEN       optional Bearer token required on /v1/*
  DIFFUSERS_SANDBOX=1       force placeholders
  DIFFUSERS_MODEL_ID        optional local path / HF id of a text-to-image model for /v1/motif (real path)
  DIFFUSERS_ALLOW_DOWNLOAD  1 allows from_pretrained to fetch weights (default: local files only)
  DIFFUSERS_REJECT_PLACEHOLDER=1  return 503 instead of a placeholder
  DIFFUSERS_ALLOWED_CHECKPOINTS   comma-separated allow-list for the `checkpoint` label
  DIFFUSERS_MODEL_LICENSE / DIFFUSERS_OUTPUT_LICENSE / DIFFUSERS_MODEL_VERSION  provenance for real output
  DIFFUSERS_MAX_BODY_BYTES (30000000), DIFFUSERS_TIMEOUT_SECONDS (100)
"""

from __future__ import annotations

import asyncio
import base64
import binascii
import hashlib
import hmac
import io
import logging
import os
import random
import re
import threading
import uuid
from typing import Annotated, Literal, Optional, Union

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.concurrency import run_in_threadpool
from PIL import Image, ImageColor, ImageDraw, ImageFont
from pydantic import BaseModel, Field, StringConstraints

log = logging.getLogger("verse_gpu_server")

MAX_B64_CHARS = 14_000_000
MAX_BODY_BYTES = int(os.environ.get("DIFFUSERS_MAX_BODY_BYTES", "30000000"))
TIMEOUT_S = float(os.environ.get("DIFFUSERS_TIMEOUT_SECONDS", "100"))
MAX_INPUT_PIXELS = 25_000_000
Image.MAX_IMAGE_PIXELS = MAX_INPUT_PIXELS
CHECKPOINT_RE = re.compile(r"^[A-Za-z0-9._:/@+-]{1,200}$")
HEX_RE = re.compile(r"#[0-9a-fA-F]{6}\b")
MIME_TO_FORMAT = {"image/png": "PNG", "image/jpeg": "JPEG", "image/webp": "WEBP"}

Seed = Union[int, Annotated[str, StringConstraints(min_length=1, max_length=200)]]


# --------------------------------------------------------------------------- models
class MotifRequest(BaseModel):
    seed: Seed
    prompt: str = Field(min_length=1, max_length=2000)
    motif: Optional[str] = Field(default=None, max_length=200)
    palette: str = Field(min_length=1, max_length=200)
    placement: str = Field(min_length=1, max_length=100)
    checkpoint: Optional[str] = Field(default=None, max_length=200)
    modelVersion: Optional[str] = Field(default=None, max_length=100)


class FlatMockupRequest(BaseModel):
    seed: Seed
    garmentFamily: str = Field(min_length=1, max_length=60)
    colour: Optional[str] = Field(default=None, max_length=40)
    placement: str = Field(min_length=1, max_length=100)
    artworkBase64: Optional[str] = Field(default=None, min_length=8, max_length=MAX_B64_CHARS)
    artworkMimeType: Optional[Literal["image/png", "image/jpeg", "image/webp", "image/svg+xml"]] = None
    checkpoint: Optional[str] = Field(default=None, max_length=200)
    modelVersion: Optional[str] = Field(default=None, max_length=100)


class ImageResponse(BaseModel):
    imageBase64: str
    mimeType: Literal["image/png"] = "image/png"
    modelName: str
    modelVersion: str
    modelLicense: str
    outputLicense: str
    requestId: str
    isSimulation: bool
    notice: Optional[str] = None


# --------------------------------------------------------------------------- middleware / auth
class _TooLarge(Exception):
    pass


class BodyLimitMiddleware:
    """Pure-ASGI request size cap that also covers chunked bodies without Content-Length."""

    def __init__(self, app, max_bytes: int):
        self.app, self.max_bytes = app, max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        started = False

        async def _send(message):
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        async def _reject():
            await _send({"type": "http.response.start", "status": 413,
                         "headers": [(b"content-type", b"application/json")]})
            await _send({"type": "http.response.body", "body": b'{"detail":"Request body too large"}'})

        for k, v in scope.get("headers", []):
            if k == b"content-length":
                try:
                    if int(v) > self.max_bytes:
                        return await _reject()
                except ValueError:
                    return await _reject()

        seen = 0

        async def _receive():
            nonlocal seen
            msg = await receive()
            if msg["type"] == "http.request":
                seen += len(msg.get("body", b""))
                if seen > self.max_bytes:
                    raise _TooLarge()
            return msg

        try:
            await self.app(scope, _receive, _send)
        except _TooLarge:
            if not started:
                await _reject()


app = FastAPI(title="VERSE GPU server (diffusers wrapper)", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(BodyLimitMiddleware, max_bytes=MAX_BODY_BYTES)


def require_auth(authorization: Optional[str] = Header(default=None)) -> None:
    token = os.environ.get("DIFFUSERS_API_TOKEN", "")
    if not token:
        return
    supplied = authorization[7:] if authorization and authorization.lower().startswith("bearer ") else ""
    if not hmac.compare_digest(supplied.encode(), token.encode()):
        raise HTTPException(status_code=401, detail="Unauthorized", headers={"WWW-Authenticate": "Bearer"})


# --------------------------------------------------------------------------- helpers
def _flag(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in {"1", "true", "yes"}


def seed_to_int(seed: Union[int, str]) -> int:
    s = str(seed)
    if re.fullmatch(r"-?\d{1,18}", s):
        return int(s) % (2**32)
    return int(hashlib.sha256(s.encode()).hexdigest()[:8], 16)


def check_checkpoint(cp: Optional[str]) -> None:
    if cp is None:
        return
    allowed = [c.strip() for c in os.environ.get("DIFFUSERS_ALLOWED_CHECKPOINTS", "").split(",") if c.strip()]
    if not CHECKPOINT_RE.match(cp) or (allowed and cp not in allowed):
        raise HTTPException(422, "checkpoint not permitted")


def _font(size: int):
    try:
        return ImageFont.load_default(size=size)  # Pillow >= 10.1
    except TypeError:
        return ImageFont.load_default()


def encode_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def decode_artwork(b64: str, mime: str) -> Optional[Image.Image]:
    """Return an RGBA image, or None for SVG (never rasterised: untrusted markup)."""
    if mime == "image/svg+xml":
        return None
    try:
        raw = base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(422, "artwork: invalid base64")
    try:
        img = Image.open(io.BytesIO(raw))
        if img.format != MIME_TO_FORMAT[mime]:
            raise HTTPException(422, "artwork: bytes do not match declared MIME type")
        if img.width * img.height > MAX_INPUT_PIXELS:
            raise HTTPException(422, "artwork: image too large")
        img.load()
        return img.convert("RGBA")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, "artwork: unreadable image")


def palette_colours(palette: str, rng: random.Random) -> list:
    cols = [ImageColor.getrgb(h) for h in HEX_RE.findall(palette)[:6]]
    return cols or [tuple(rng.randint(40, 230) for _ in range(3)) for _ in range(4)]


def parse_colour(name: Optional[str], rng: random.Random) -> tuple:
    if name:
        try:
            return ImageColor.getrgb(name.strip())[:3]
        except ValueError:
            pass
    return tuple(rng.randint(90, 220) for _ in range(3))


def _banner(img: Image.Image, title: str, lines: list) -> None:
    d = ImageDraw.Draw(img)
    w, h = img.size
    d.rectangle([0, 0, w, 120], fill=(20, 20, 20))
    d.text((24, 16), "SANDBOX SIMULATION", fill=(255, 205, 0), font=_font(44))
    d.text((24, 74), title, fill=(255, 255, 255), font=_font(24))
    d.rectangle([0, h - 40 * len(lines) - 16, w, h], fill=(20, 20, 20))
    for i, line in enumerate(lines):
        d.text((24, h - 40 * len(lines) - 4 + i * 40), line, fill=(220, 220, 220), font=_font(22))


def sandbox_motif(req: MotifRequest, seed: int, request_id: str) -> Image.Image:
    rng = random.Random(seed)
    cols = palette_colours(req.palette, rng)
    size = 1024
    img = Image.new("RGB", (size, size), (245, 245, 245))
    d = ImageDraw.Draw(img)
    for _ in range(40):
        c = rng.choice(cols)
        x, y, r = rng.randint(0, size), rng.randint(130, size), rng.randint(30, 180)
        box = [x - r, y - r, x + r, y + r]
        (d.ellipse if rng.random() < 0.5 else d.rectangle)(box, fill=c)
    label = (req.motif or "motif")[:40]
    _banner(img, "NOT A GENERATED MOTIF - NO MODEL RAN",
            [f"motif={label}  placement={req.placement[:30]}", f"seed={seed}  req={request_id[:24]}"])
    return img


# placement keyword -> (cx, cy, max_w) as fractions of the 1024x1024 canvas
_PLACEMENTS = (("left", (0.62, 0.38, 0.14)), ("pocket", (0.62, 0.38, 0.14)), ("sleeve", (0.82, 0.30, 0.12)),
               ("back", (0.50, 0.46, 0.36)), ("all", (0.50, 0.50, 0.50)))


def sandbox_flat_mockup(req: FlatMockupRequest, seed: int, request_id: str, art: Optional[Image.Image]) -> Image.Image:
    rng = random.Random(seed)
    fill = parse_colour(req.colour, rng)
    size = 1024
    img = Image.new("RGB", (size, size), (238, 238, 238))
    d = ImageDraw.Draw(img)
    # generic tee-like silhouette (same for every garmentFamily: this is a placeholder)
    poly = [(300, 210), (420, 210), (512, 260), (604, 210), (724, 210), (900, 380), (820, 470), (740, 410),
            (740, 880), (284, 880), (284, 410), (204, 470), (124, 380)]
    d.polygon(poly, fill=fill, outline=(60, 60, 60))
    cx, cy, mw = 0.50, 0.42, 0.28
    for key, val in _PLACEMENTS:
        if key in req.placement.lower():
            cx, cy, mw = val
            break
    if art is not None:
        a = art.copy()
        a.thumbnail((int(size * mw), int(size * mw)))
        img.paste(a, (int(size * cx - a.width / 2), int(size * cy - a.height / 2)), a)
    note = "artwork composited" if art is not None else (
        "svg artwork not rasterised" if req.artworkMimeType == "image/svg+xml" else "no artwork")
    _banner(img, "NOT A REAL MOCKUP - GENERIC SILHOUETTE",
            [f"family={req.garmentFamily[:30]}  placement={req.placement[:30]}", f"{note}  seed={seed}  req={request_id[:20]}"])
    return img


# --------------------------------------------------------------------------- real motif pipeline (optional, lazy)
_gpu_lock = threading.Lock()  # held by the worker thread until generation ends (even after a timeout)
_pipe = None


def _real_reason() -> Optional[str]:
    """None when the real motif pipeline can run, else the reason for the sandbox fallback."""
    if _flag("DIFFUSERS_SANDBOX"):
        return "DIFFUSERS_SANDBOX=1"
    if not os.environ.get("DIFFUSERS_MODEL_ID"):
        return "DIFFUSERS_MODEL_ID not set"
    try:
        import torch
        if not torch.cuda.is_available():
            return "CUDA unavailable"
    except Exception:
        return "torch not installed"
    return None


def _get_pipe():
    global _pipe
    if _pipe is None:
        import torch
        from diffusers import AutoPipelineForText2Image

        _pipe = AutoPipelineForText2Image.from_pretrained(
            os.environ["DIFFUSERS_MODEL_ID"], torch_dtype=torch.float16,
            local_files_only=not _flag("DIFFUSERS_ALLOW_DOWNLOAD"),
        ).to("cuda")
    return _pipe


def _run_real_motif(req: MotifRequest, seed: int) -> Image.Image:
    if not _gpu_lock.acquire(timeout=5):
        raise HTTPException(429, "GPU busy", headers={"Retry-After": "5"})
    try:
        import torch

        gen = torch.Generator(device="cuda").manual_seed(seed)
        return _get_pipe()(prompt=req.prompt, width=1024, height=1024, generator=gen).images[0].convert("RGB")
    finally:
        _gpu_lock.release()


def _provenance_real() -> dict:
    return dict(
        modelName=os.environ.get("DIFFUSERS_MODEL_ID", "diffusers")[-100:],
        modelVersion=os.environ.get("DIFFUSERS_MODEL_VERSION", "unversioned"),
        modelLicense=os.environ.get("DIFFUSERS_MODEL_LICENSE", "UNVERIFIED - review required"),
        outputLicense=os.environ.get("DIFFUSERS_OUTPUT_LICENSE", "UNVERIFIED - review required"),
    )


def _provenance_sandbox() -> dict:
    return dict(
        modelName="verse-sandbox-placeholder", modelVersion="sandbox-1",
        modelLicense="N/A (placeholder, no model used)",
        outputLicense="N/A (simulation placeholder - not for sale or publication)",
    )


# --------------------------------------------------------------------------- routes
@app.get("/health")
def health():
    reason = _real_reason()
    return {"status": "ok", "motifMode": "sandbox" if reason else "real", "reason": reason,
            "flatMockupMode": "sandbox", "pipelineLoaded": _pipe is not None}


async def _with_timeout(fn, *args):
    try:
        return await asyncio.wait_for(run_in_threadpool(fn, *args), TIMEOUT_S)
    except asyncio.TimeoutError:
        raise HTTPException(504, "Generation timed out")


def _reject_if_required() -> None:
    if _flag("DIFFUSERS_REJECT_PLACEHOLDER"):
        raise HTTPException(503, "Real generation unavailable")


@app.post("/v1/motif", response_model=ImageResponse, dependencies=[Depends(require_auth)])
async def motif(req: MotifRequest) -> ImageResponse:
    request_id = uuid.uuid4().hex
    check_checkpoint(req.checkpoint)
    seed = seed_to_int(req.seed)
    reason = _real_reason()
    if reason is None:
        try:
            img = await _with_timeout(_run_real_motif, req, seed)
        except HTTPException:
            raise
        except Exception:
            log.exception("motif generation failed request_id=%s", request_id)
            raise HTTPException(500, "Generation failed")
        return ImageResponse(imageBase64=await run_in_threadpool(encode_png, img), requestId=request_id,
                             isSimulation=False, **_provenance_real())
    _reject_if_required()
    img = await run_in_threadpool(sandbox_motif, req, seed, request_id)
    return ImageResponse(imageBase64=await run_in_threadpool(encode_png, img), requestId=request_id,
                         isSimulation=True, notice=f"Sandbox placeholder: {reason}. No model was executed.",
                         **_provenance_sandbox())


@app.post("/v1/flat-mockup", response_model=ImageResponse, dependencies=[Depends(require_auth)])
async def flat_mockup(req: FlatMockupRequest) -> ImageResponse:
    request_id = uuid.uuid4().hex
    check_checkpoint(req.checkpoint)
    if (req.artworkBase64 is None) != (req.artworkMimeType is None):
        raise HTTPException(422, "artworkBase64 and artworkMimeType must be provided together")
    # No real flat-mockup pipeline is wired yet: output is always a labelled placeholder.
    _reject_if_required()
    seed = seed_to_int(req.seed)
    art = await run_in_threadpool(decode_artwork, req.artworkBase64, req.artworkMimeType) if req.artworkBase64 else None
    img = await run_in_threadpool(sandbox_flat_mockup, req, seed, request_id, art)
    return ImageResponse(imageBase64=await run_in_threadpool(encode_png, img), requestId=request_id,
                         isSimulation=True,
                         notice="Sandbox placeholder: flat-mockup has no real pipeline yet. No model was executed.",
                         **_provenance_sandbox())
