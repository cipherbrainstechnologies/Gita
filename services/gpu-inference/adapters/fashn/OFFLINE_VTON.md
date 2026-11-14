# Free FASHN VTON 1.5 (self-hosted — zero paid API)

## Weights (verify licence before commercial use)
```bash
cd services/gpu-inference/adapters/fashn
python scripts/download_weights.py  # upstream official script when present
# Expected files under weights/: model.safetensors, dwpose/*.onnx
```

## Local NVIDIA GPU
```bash
pip install -r requirements.txt
pip install -e ../../../../vendor/fashn-vton-1.5
export FASHN_WEIGHTS_DIR=./weights
export FASHN_VTON_API_TOKEN=local-dev-token
uvicorn app:app --host 0.0.0.0 --port 8091
```

Point Gita `FASHN_VTON_API_URL` at `http://127.0.0.1:8091` (never FASHN paid cloud).

## Google Colab / Kaggle (temporary GPU)
1. Upload `vendor/fashn-vton-1.5` + this `app.py` to the runtime.
2. Download weights to `weights/` (not committed to git).
3. Run uvicorn; expose via ngrok **only for batch export**, not as Railway production dependency.
4. Run from your laptop: `npm run offline:catalog-render -- --limit=20 --vton --persist` with `FASHN_VTON_API_URL` pointed at the tunnel.

## Batch CLI
```bash
python cli_batch_vton.py --manifest skus.json --out-dir /path/exports
```

Outputs stay outside git; register with `npm run offline:catalog-render` against production DB over SSH.