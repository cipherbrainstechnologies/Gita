"""Minimal HTTP wrapper around FASHN VTON v1.5 for remote callers (VERSE_MODE).

Contract (see apps/web/src/lib/providers/graphic/remote.ts when present):
    POST /v1/tryon -> {imageBase64, mimeType, modelName, modelVersion, modelLicense,
                       outputLicense, requestId, isSimulation, notice?}
    GET  /health

Safety properties:
  * No URL fetching: images arrive only as base64 in the JSON body.
  * Request body, base64 field, and decoded pixel counts are capped.
  * Inference runs in a worker thread with a timeout and a single-flight GPU lock.
  * Weights are never downloaded here; the pipeline is lazy-loaded only if weights exist locally.
  * `checkpoint` is a provenance label only, never a filesystem path.
  * Sandbox (placeholder) output is explicitly labelled and flagged isSimulation=true.

Environment:
  FASHN_VTON_API_TOKEN      optional Bearer token required on /v1/*
  FASHN_SANDBOX=1           force placeholder output
  FASHN_WEIGHTS_DIR         weights directory (default ./weights)
  FASHN_REJECT_PLACEHOLDER=1  return 503 instead of a placeholder when real inference is unavailable
  FASHN_ALLOWED_CHECKPOINTS comma-separated allow-list for the `checkpoint` label (optional)
  FASHN_MODEL_VERSION / FASHN_MODEL_LICENSE / FASHN_OUTPUT_LICENSE  provenance strings for real output
  FASHN_MAX_BODY_BYTES      default 30000000
  FASHN_TIMEOUT_SECONDS     default 100
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
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel, Field, StringConstraints

log = logging.getLogger("fashn_server")

MAX_B64_CHARS = 14_000_000  # matches client schema
MAX_BODY_BYTES = int(os.environ.get("FASHN_MAX_BODY_BYTES", "30000000"))
TIMEOUT_S = float(os.environ.get("FASHN_TIMEOUT_SECONDS", "100"))
MAX_INPUT_PIXELS = 25_000_000
Image.MAX_IMAGE_PIXELS = MAX_INPUT_PIXELS  # Pillow raises DecompressionBombError above 2x this

MIME_TO_FORMAT = {"image/png": "PNG", "image/jpeg": "JPEG", "image/webp": "WEBP"}
CHECKPOINT_RE = re.compile(r"^[A-Za-z0-9._:/@+-]{1,200}$")

Mime = Literal["image/png", "image/jpeg", "image/webp"]
Seed = Union[int, Annotated[str, StringConstraints(min_length=1, max_length=200)]]


# --------------------------------------------------------------------------- models
class TryOnRequest(BaseModel):
    seed: Seed
    category: Literal["tops", "bottoms", "one-pieces"]
    garmentImageBase64: str = Field(min_length=8, max_length=MAX_B64_CHARS)
    garmentMimeType: Mime
    personImageBase64: Optional[str] = Field(default=None, min_length=8, max_length=MAX_B64_CHARS)
    personMimeType: Optional[Mime] = None
    checkpoint: Optional[str] = Field(default=None, max_length=200)
    garmentPhotoType: Literal["model", "flat-lay"] = "model"


class TryOnResponse(BaseModel):
    imageBase64: str
    mimeType: Mime
    modelName: str
    modelVersion: str
    modelLicense: str
    outputLicense: str
    requestId: str
    isSimulation: bool
    notice: Optional[str] = None


# --------------------------------------------------------------------------- middleware
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


app = FastAPI(title="FASHN VTON server (VERSE_MODE wrapper)", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(BodyLimitMiddleware, max_bytes=MAX_BODY_BYTES)


def require_auth(authorization: Optional[str] = Header(default=None)) -> None:
    token = os.environ.get("FASHN_VTON_API_TOKEN", "")
    if not token:
        return
    supplied = authorization[7:] if authorization and authorization.lower().startswith("bearer ") else ""
    if not hmac.compare_digest(supplied.encode(), token.encode()):
        raise HTTPException(status_code=401, detail="Unauthorized", headers={"WWW-Authenticate": "Bearer"})


# --------------------------------------------------------------------------- helpers
def _flag(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in {"1", "true", "yes"}


def _weights_dir() -> str:
    return os.path.abspath(os.environ.get("FASHN_WEIGHTS_DIR", "weights"))


def _weights_present() -> bool:
    d = _weights_dir()
    return all(os.path.isfile(os.path.join(d, p)) for p in (
        "model.safetensors", os.path.join("dwpose", "yolox_l.onnx"), os.path.join("dwpose", "dw-ll_ucoco_384.onnx")))


def _cuda_available() -> bool:
    try:
        import torch  # lazy: sandbox mode must work without torch installed
        return bool(torch.cuda.is_available())
    except Exception:
        return False


def _real_unavailable_reason() -> Optional[str]:
    """None when real inference can run, else a short human-readable reason."""
    if _flag("FASHN_SANDBOX"):
        return "FASHN_SANDBOX=1"
    if not _weights_present():
        return "model weights not found"
    if not _cuda_available():
        return "CUDA unavailable"
    return None


def seed_to_int(seed: Union[int, str]) -> int:
    s = str(seed)
    if re.fullmatch(r"-?\d{1,18}", s):
        return int(s) % (2**32)
    return int(hashlib.sha256(s.encode()).hexdigest()[:8], 16)


def decode_image(b64: str, mime: str, label: str) -> Image.Image:
    try:
        raw = base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(422, f"{label}: invalid base64")
    try:
        img = Image.open(io.BytesIO(raw))
        if img.format != MIME_TO_FORMAT[mime]:
            raise HTTPException(422, f"{label}: bytes do not match declared MIME type")
        if img.width * img.height > MAX_INPUT_PIXELS:
            raise HTTPException(422, f"{label}: image too large")
        img.load()
        return img.convert("RGB")
    except HTTPException:
        raise
    except Exception:  # includes DecompressionBombError / UnidentifiedImageError
        raise HTTPException(422, f"{label}: unreadable image")


def encode_png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=False)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _font(size: int):
    try:
        return ImageFont.load_default(size=size)  # Pillow >= 10.1
    except TypeError:
        return ImageFont.load_default()


def placeholder_png(*, category: str, seed: int, request_id: str, garment: Optional[Image.Image]) -> Image.Image:
    w, h = 768, 1024
    rng = random.Random(seed)
    base = tuple(rng.randint(150, 225) for _ in range(3))
    img = Image.new("RGB", (w, h), base)
    d = ImageDraw.Draw(img)
    for x in range(-h, w, 48):  # diagonal hatch so it can never pass for a photo
        d.line([(x, 0), (x + h, h)], fill=tuple(max(0, c - 25) for c in base), width=6)
    if garment is not None:
        g = garment.copy()
        g.thumbnail((w - 160, 560))
        img.paste(g, ((w - g.width) // 2, 220))
    d.rectangle([0, 0, w, 150], fill=(20, 20, 20))
    d.text((32, 24), "SANDBOX SIMULATION", fill=(255, 205, 0), font=_font(48))
    d.text((32, 90), "NOT A REAL TRY-ON - NO MODEL RAN", fill=(255, 255, 255), font=_font(28))
    d.rectangle([0, h - 110, w, h], fill=(20, 20, 20))
    d.text((32, h - 96), f"category={category}  seed={seed}", fill=(255, 255, 255), font=_font(26))
    d.text((32, h - 56), f"req={request_id[:24]}", fill=(190, 190, 190), font=_font(22))
    return img


# --------------------------------------------------------------------------- real pipeline (lazy)
_gpu_lock = threading.Lock()  # one inference at a time; held by the worker thread until it ends
_pipeline = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from fashn_vton import TryOnPipeline  # lazy: heavy import

        _pipeline = TryOnPipeline(weights_dir=_weights_dir())
    return _pipeline


def _run_real(req: TryOnRequest, seed: int, person: Image.Image, garment: Image.Image) -> Image.Image:
    if not _gpu_lock.acquire(timeout=5):
        raise HTTPException(429, "GPU busy", headers={"Retry-After": "5"})
    try:
        out = _get_pipeline()(
            person_image=person, garment_image=garment, category=req.category,
            garment_photo_type=req.garmentPhotoType, num_samples=1, seed=seed,
        )
        return out.images[0].convert("RGB")
    finally:
        _gpu_lock.release()


# --------------------------------------------------------------------------- routes
@app.get("/health")
def health():
    reason = _real_unavailable_reason()
    return {"status": "ok", "mode": "sandbox" if reason else "real", "reason": reason, "pipelineLoaded": _pipeline is not None}


@app.post("/v1/tryon", response_model=TryOnResponse, dependencies=[Depends(require_auth)])
async def tryon(req: TryOnRequest) -> TryOnResponse:
    request_id = uuid.uuid4().hex
    if req.checkpoint is not None:
        allowed = [c.strip() for c in os.environ.get("FASHN_ALLOWED_CHECKPOINTS", "").split(",") if c.strip()]
        if not CHECKPOINT_RE.match(req.checkpoint) or (allowed and req.checkpoint not in allowed):
            raise HTTPException(422, "checkpoint not permitted")
    if (req.personImageBase64 is None) != (req.personMimeType is None):
        raise HTTPException(422, "personImageBase64 and personMimeType must be provided together")

    seed = seed_to_int(req.seed)
    reason = _real_unavailable_reason()
    if reason and _flag("FASHN_REJECT_PLACEHOLDER"):
        raise HTTPException(503, "Real inference unavailable")

    garment = await run_in_threadpool(decode_image, req.garmentImageBase64, req.garmentMimeType, "garment")

    if reason is None:
        if req.personImageBase64 is None:
            raise HTTPException(422, "personImageBase64 is required for real inference")
        person = await run_in_threadpool(decode_image, req.personImageBase64, req.personMimeType, "person")
        try:
            result = await asyncio.wait_for(run_in_threadpool(_run_real, req, seed, person, garment), TIMEOUT_S)
        except asyncio.TimeoutError:
            raise HTTPException(504, "Inference timed out")
        except HTTPException:
            raise
        except Exception:
            log.exception("tryon inference failed request_id=%s", request_id)
            raise HTTPException(500, "Inference failed")
        return TryOnResponse(
            imageBase64=await run_in_threadpool(encode_png, result), mimeType="image/png",
            modelName="fashn-vton-1.5", modelVersion=os.environ.get("FASHN_MODEL_VERSION", "1.5.0"),
            modelLicense=os.environ.get("FASHN_MODEL_LICENSE", "Apache-2.0"),
            outputLicense=os.environ.get("FASHN_OUTPUT_LICENSE", "UNVERIFIED - review required"),
            requestId=request_id, isSimulation=False,
        )

    img = await run_in_threadpool(placeholder_png, category=req.category, seed=seed, request_id=request_id, garment=garment)
    return TryOnResponse(
        imageBase64=await run_in_threadpool(encode_png, img), mimeType="image/png",
        modelName="fashn-vton-sandbox-placeholder", modelVersion="sandbox-1",
        modelLicense="N/A (placeholder, no model used)",
        outputLicense="N/A (simulation placeholder - not for sale or publication)",
        requestId=request_id, isSimulation=True,
        notice=f"Sandbox placeholder: {reason}. No try-on model was executed.",
    )
