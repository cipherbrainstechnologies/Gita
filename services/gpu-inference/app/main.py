"""GPU inference gateway scaffold.

Wire vendor/diffusers and vendor/fashn-vton-1.5 behind these routes.
Do not run this process inside the Railway Next.js container.
"""

from __future__ import annotations

import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Gita GPU Inference", version="0.1.0")


def require_token(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    expected = os.getenv("GPU_SERVICE_TOKEN")
    if not expected:
        # Fail closed when token is configured in production; allow local boot without it.
        if os.getenv("GPU_REQUIRE_AUTH", "false").lower() == "true":
            raise HTTPException(status_code=503, detail="GPU_SERVICE_TOKEN not configured")
        return
    if not authorization or authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")


class HealthResponse(BaseModel):
    status: str
    vendors: dict[str, str]


class TryOnRequest(BaseModel):
    person_image_url: str = Field(..., description="HTTPS URL of person photo")
    garment_image_url: str = Field(..., description="HTTPS URL of garment / flat lay")
    idempotency_key: str | None = None


class TryOnResponse(BaseModel):
    status: str
    job_id: str | None = None
    detail: str


class DesignRenderRequest(BaseModel):
    brief: str = Field(..., min_length=8, max_length=4000)
    idempotency_key: str | None = None


class DesignRenderResponse(BaseModel):
    status: str
    job_id: str | None = None
    detail: str


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        vendors={
            "diffusers": "vendor/diffusers",
            "fashn_vton": "vendor/fashn-vton-1.5",
        },
    )


@app.post("/v1/tryon", response_model=TryOnResponse, dependencies=[Depends(require_token)])
def tryon(body: TryOnRequest) -> TryOnResponse:
    # TODO: load FASHN pipeline from vendor/fashn-vton-1.5 and run inference.
    return TryOnResponse(
        status="not_configured",
        job_id=body.idempotency_key,
        detail="FASHN VTON adapter not wired yet. Install vendor package and weights on a GPU host.",
    )


@app.post(
    "/v1/design/render",
    response_model=DesignRenderResponse,
    dependencies=[Depends(require_token)],
)
def design_render(body: DesignRenderRequest) -> DesignRenderResponse:
    # TODO: call Diffusers pipelines from vendor/diffusers for studio renders.
    return DesignRenderResponse(
        status="not_configured",
        job_id=body.idempotency_key,
        detail="Diffusers adapter not wired yet. Install vendor package and approved model weights.",
    )
