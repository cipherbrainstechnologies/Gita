# Known challenges

### Nested upstream repos without formal `.gitmodules` (solved)

- Description: `diffusers` and `fashn-vton-1.5` were gitlinks (mode 160000) at repo root without `.gitmodules`.
- Workarounds / Decisions: Moved under `vendor/*` and added `.gitmodules` with upstream URLs.
- Status: Solved
- Owner: Platform

### Kit vs deployable confusion (solved)

- Description: `VERSE_MODE_Cursor_Kit` looked like both the Cursor blueprint and the Railway app.
- Workarounds / Decisions: Promoted runtime to `apps/web`; kit marker at `kits/verse-mode-cursor`.
- Status: Solved
- Owner: CTO / Platform

### GPU on Railway web (open)

- Description: Studio try-on and design renders need CUDA; Railway web container must not host Torch.
- Workarounds / Decisions: `services/gpu-inference` scaffold + HTTP contract; wire adapters next.
- Status: Open
- Owner: ML / Backend
