# FASHN VTON HTTP adapter (VERSE_MODE)

Minimal FastAPI service exposing `TryOnPipeline` to `apps/web`.

Upstream library: `vendor/fashn-vton-1.5` (do not put product HTTP code inside vendor).

## Run

```powershell
cd e:\Projects\Gita\services\gpu-inference
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements-fashn.txt      # sandbox mode only
pip install -e ..\..\vendor\fashn-vton-1.5 # additionally, for real inference
$env:FASHN_SANDBOX = "1"                   # placeholder output, no GPU/weights needed
$env:FASHN_VTON_API_TOKEN = "change-me"    # optional Bearer auth
$env:PYTHONPATH = "e:\Projects\Gita\services\gpu-inference"
python -m uvicorn adapters.fashn.app:app --host 127.0.0.1 --port 8100
```

Real inference runs only when `FASHN_SANDBOX` is unset, weights exist under `vendor/fashn-vton-1.5/weights` (download manually; the server never fetches them), and CUDA is available.

## API

`GET /health` -> `{status, mode: "sandbox"|"real", reason, pipelineLoaded}` (no auth).

`POST /v1/tryon` (Bearer token if `FASHN_VTON_API_TOKEN` is set)

```json
{"seed": "123", "category": "tops", "garmentImageBase64": "...", "garmentMimeType": "image/png",
 "personImageBase64": "...", "personMimeType": "image/jpeg", "checkpoint": "fashn-vton-1.5",
 "garmentPhotoType": "model"}
```

Response: `{imageBase64, mimeType, modelName, modelVersion, modelLicense, outputLicense, requestId, isSimulation, notice?}`.

- `person*` fields are required only for real inference (both or neither).
- `garmentPhotoType` (`model` | `flat-lay`) is optional, default `model`.
- `isSimulation: true` means a **placeholder** was returned.
- `checkpoint` is a provenance label only (never a path); restrict with `FASHN_ALLOWED_CHECKPOINTS`.
