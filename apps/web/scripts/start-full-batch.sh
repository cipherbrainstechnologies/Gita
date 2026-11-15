#!/bin/sh
cd /app || exit 1
setsid npx tsx scripts/batch-on-model-render.ts --force --limit=1000 --batch-size=10 \
  >/tmp/catalog-v6-render.log 2>&1 </dev/null &
echo "BG_PID=$!"
sleep 4
wc -l /tmp/catalog-v6-render.log || true
tail -n 8 /tmp/catalog-v6-render.log || true
