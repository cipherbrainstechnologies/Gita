import type {MedusaRequest, MedusaResponse} from "@medusajs/framework/http";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    ok: true,
    service: "gita-medusa-commerce",
    workerMode: process.env.MEDUSA_WORKER_MODE ?? "server",
    at: new Date().toISOString(),
  });
}