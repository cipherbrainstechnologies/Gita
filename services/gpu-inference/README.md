# GPU inference service

Thin HTTP gateway around:

- `vendor/diffusers` — generative / design pipelines  
- `vendor/fashn-vton-1.5` — virtual try-on  

## Why separate

`apps/web` on Railway must stay a Node modular monolith. Torch/CUDA workloads belong here (or a managed GPU API with the same contract).

## Contract (initial)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| POST | `/v1/tryon` | Person + garment → try-on image (FASHN) |
| POST | `/v1/design/render` | Design brief → candidate renders (Diffusers) |

Auth: shared service token (`GPU_SERVICE_TOKEN`) required on mutating routes.  
Idempotency: clients send `Idempotency-Key`; store result references, not raw secrets.

## Local

**Try-on (FASHN adapter — preferred entry today):** see [`adapters/fashn/README.md`](adapters/fashn/README.md).

**Gateway scaffold** (health + stub routes):

```bash
cd services/gpu-inference
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8090
```

Install editable vendors when developing real inference:

```bash
pip install -e ../../vendor/fashn-vton-1.5
pip install -e ../../vendor/diffusers
```

Weights stay outside git (`weights/`, Hugging Face cache). Model licenses must be reviewed before commercial use.
