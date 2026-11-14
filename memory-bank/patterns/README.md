# Implementation patterns

Patterns used more than once across Gita should be recorded here.

### Pattern: External GPU via HTTP adapter

- Intent: Keep Torch/CUDA out of Railway `apps/web`; call `services/gpu-inference` with idempotency keys.
- Use When: Studio renders, try-on, any model inference.
- Avoid When: Pure CPU image transforms that already run in Node/Sharp safely.
- Risk: Timeouts and cost spikes — always bound batch size and store job status in Postgres.
