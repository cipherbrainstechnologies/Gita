#!/usr/bin/env python3
"""Minimal offline VTON batch — self-hosted FASHN weights only (no paid API)."""
from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

import httpx


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", required=True, help="Self-hosted app.py base URL")
    p.add_argument("--token", default="")
    p.add_argument("--manifest", type=Path, required=True, help="JSON list of tryon payloads")
    p.add_argument("--out-dir", type=Path, required=True)
    args = p.parse_args()
    rows = json.loads(args.manifest.read_text())
    args.out_dir.mkdir(parents=True, exist_ok=True)
    headers = {"content-type": "application/json"}
    if args.token:
        headers["authorization"] = f"Bearer {args.token}"
    for i, row in enumerate(rows):
        r = httpx.post(f"{args.base_url.rstrip('/')}/v1/tryon", json=row, headers=headers, timeout=120)
        r.raise_for_status()
        data = r.json()
        if data.get("isSimulation"):
            print(f"skip {i}: simulation", file=sys.stderr)
            continue
        out = args.out_dir / f"{row.get('seed','x')}_{i}.png"
        out.write_bytes(base64.b64decode(data["imageBase64"]))
        print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())