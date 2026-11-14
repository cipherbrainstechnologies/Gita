# Diffusers GPU adapter (VERSE_MODE)

Minimal FastAPI service for motif / flat-mockup renders used by `apps/web`
(`src/lib/providers/graphic/remote.ts`, `diffusersAdapter.ts`).

Upstream library: `vendor/diffusers` (do not put product HTTP code inside vendor).

## Run

```powershell
cd e:\Projects\Gita\services\gpu-inference
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r adapters\diffusers\requirements.txt
pip install -e ..\..\vendor\diffusers
$env:DIFFUSERS_SANDBOX = "1"
$env:DIFFUSERS_API_TOKEN = "change-me"
$env:PYTHONPATH = "e:\Projects\Gita\services\gpu-inference"
python -m uvicorn adapters.diffusers.app:app --host 127.0.0.1 --port 8200
```

Point `apps/web` GPU env at `http://127.0.0.1:8200` (host on allow-list; TLS off-box in prod).

## API

`GET /health` (no auth) -> `{status, motifMode, reason, flatMockupMode, pipelineLoaded}`.

`POST /v1/motif` — motif/artwork candidate  
`POST /v1/flat-mockup` — garment flat mockup  

Both return `{imageBase64, mimeType, modelName, modelVersion, modelLicense, outputLicense, requestId, isSimulation, notice?}`.
