import {NextResponse} from "next/server";
import {checkoutEnabled, stage, withTimeout} from "@/lib/config";

export const dynamic = "force-dynamic";

async function dbProbe(): Promise<{ok: boolean; ai: boolean}> {
  if (!process.env.DATABASE_URL) return {ok: false, ai: false};
  try {
    const {prisma} = await import("@/lib/db");
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2500);
    const ai = await withTimeout(prisma.integrationSetting.count({where: {provider: "AI_RENDER"}}), 2000).then(n => n > 0).catch(() => false);
    return {ok: true, ai};
  } catch { return {ok: false, ai: false}; }
}
/** null = REDIS_URL not configured (not an error for the web process). */
async function redisProbe(): Promise<boolean | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const {default: IORedis} = await import("ioredis");
  const r = new IORedis(url, {lazyConnect: true, connectTimeout: 1500, maxRetriesPerRequest: 0, enableOfflineQueue: false, retryStrategy: () => null});
  r.on("error", () => {});
  try { await withTimeout(r.connect().then(() => r.ping()), 2500); return true; }
  catch { return false; }
  finally { r.disconnect(); }
}

export async function GET() {
  const [db, redisOk] = await Promise.all([dbProbe(), redisProbe()]);
  // Fail the probe only when a DB is configured but unreachable; redis never gates web readiness.
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const healthy = !dbConfigured || db.ok;
  return NextResponse.json({
    status: healthy ? (db.ok ? "ok" : "degraded") : "unhealthy", service: "verse-mode-web", stage: stage(),
    checkoutEnabled: checkoutEnabled(), dbOk: db.ok, redisOk,
    // Presence flags only; no keys, ids or secrets.
    aiProviders: {render: db.ai}, at: new Date().toISOString()
  }, {status: healthy ? 200 : 503, headers: {"Cache-Control": "no-store"}});
}
