import {z} from "zod";
import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {decryptSecret} from "@/lib/vault";
import {assertAllowedUrl, assertResolvedPublic, parseAllowlist, SsrfError, type LookupFn} from "@/lib/providers/ssrf";
import {parseVaultAiRender} from "@/lib/providers/graphic";
import {writeAudit} from "../shared/audit";

export const INTEGRATION_PROVIDERS = ["RAZORPAY", "SHIPROCKET", "WHATSAPP", "SMS", "EMAIL", "AI_RENDER"] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

/**
 * NOT_CONFIGURED  nothing stored (never a success).
 * SANDBOX         credentials are in sandbox/test mode (and, where a probe exists, were accepted or deliberately not contacted).
 * LIVE_VERIFIED   a live-mode credential was accepted by a real provider call. The only "success" for production credentials.
 * FAILED          decrypt, shape, SSRF, auth, network or "no test adapter exists" failures. Never silently downgraded to success.
 */
export type TestStatus = "NOT_CONFIGURED" | "SANDBOX" | "LIVE_VERIFIED" | "FAILED";
export type TestResult = {provider: IntegrationProvider; status: TestStatus; mode: "SANDBOX" | "LIVE" | null; code: string; message: string};

export type SettingBlob = {mode: string; encryptedPayload: string; nonce: string; authTag: string};
export type TestDeps = {
  loadSetting: (provider: IntegrationProvider) => Promise<SettingBlob | null>;
  decrypt?: (blob: {payload: string; nonce: string; authTag: string}, provider: string) => string;
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
  lookup?: LookupFn;
  timeoutMs?: number;
};

const razorpaySecret = z.object({keyId: z.string().min(4), keySecret: z.string().min(4), webhookSecret: z.string().optional()});
const RAZORPAY_PROBE = "https://api.razorpay.com/v1/orders?count=1"; // fixed host, read-only: no user-controlled URL, no side effects

const done = (provider: IntegrationProvider, status: TestStatus, mode: TestResult["mode"], code: string, message: string): TestResult => ({provider, status, mode, code, message});
const asMode = (m: string): "SANDBOX" | "LIVE" => (m === "LIVE" ? "LIVE" : "SANDBOX");

async function probeRazorpay(secret: string, storedMode: "SANDBOX" | "LIVE", d: TestDeps): Promise<TestResult> {
  const P: IntegrationProvider = "RAZORPAY";
  let parsed;
  try { parsed = razorpaySecret.safeParse(JSON.parse(secret)); } catch { parsed = null; }
  if (!parsed?.success) return done(P, "FAILED", storedMode, "CREDENTIAL_SHAPE", 'Stored secret must be JSON like {"keyId":"…","keySecret":"…"}.');
  const {keyId, keySecret} = parsed.data;
  const keyMode = keyId.startsWith("rzp_live_") ? "LIVE" : keyId.startsWith("rzp_test_") ? "SANDBOX" : null;
  if (!keyMode) return done(P, "FAILED", storedMode, "KEY_PREFIX", "keyId must start with rzp_test_ or rzp_live_.");
  if (keyMode !== storedMode) return done(P, "FAILED", storedMode, "MODE_MISMATCH", `Environment is ${storedMode} but the key is a ${keyMode === "LIVE" ? "live" : "test"} key.`);
  let res: Response;
  try {
    res = await (d.fetchImpl ?? fetch)(RAZORPAY_PROBE, {method: "GET", redirect: "error", signal: AbortSignal.timeout(d.timeoutMs ?? 10_000), headers: {authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`}});
  } catch { return done(P, "FAILED", keyMode, "UNREACHABLE", "Razorpay could not be reached or timed out."); }
  if (res.status === 401 || res.status === 403) return done(P, "FAILED", keyMode, "AUTH_REJECTED", "Razorpay rejected these credentials.");
  if (!res.ok) return done(P, "FAILED", keyMode, "UPSTREAM_ERROR", `Razorpay responded with HTTP ${res.status}.`);
  return keyMode === "LIVE"
    ? done(P, "LIVE_VERIFIED", "LIVE", "OK", "Live credentials authenticated against Razorpay (read-only call). Webhook delivery is NOT verified by this test.")
    : done(P, "SANDBOX", "SANDBOX", "OK", "Test-mode credentials authenticated against Razorpay (read-only call). Webhook delivery is NOT verified by this test.");
}

async function probeAiRender(secret: string, source: "vault" | "env", storedMode: "SANDBOX" | "LIVE", d: TestDeps): Promise<TestResult> {
  const P: IntegrationProvider = "AI_RENDER";
  const env = d.env ?? process.env;
  const cfg = parseVaultAiRender(secret);
  if (!cfg) return done(P, "FAILED", storedMode, "CREDENTIAL_SHAPE", 'Stored secret must be a URL or JSON {"url":"…","token":"…"}.');
  if (source === "vault" && storedMode !== "LIVE") return done(P, "SANDBOX", "SANDBOX", "SANDBOX_NOT_CONTACTED", "Mode is SANDBOX: the worker ignores this endpoint and records labelled simulations. The endpoint was not contacted.");
  const allowedHosts = parseAllowlist(env.PROVIDER_ALLOWED_HOSTS);
  let target: URL;
  try {
    if (source === "env") allowedHosts.push(new URL(cfg.url).hostname.toLowerCase().replace(/^\[|\]$/g, ""));
    const opts = {allowedHosts, nodeEnv: env.NODE_ENV};
    const base = assertAllowedUrl(cfg.url, opts);
    target = new URL("health", base.href.endsWith("/") ? base.href : `${base.href}/`);
    await assertResolvedPublic(target, opts, d.lookup);
  } catch (e) { return done(P, "FAILED", storedMode, "BLOCKED_ENDPOINT", e instanceof SsrfError ? e.message : "Endpoint URL is not valid."); }
  let res: Response;
  try {
    res = await (d.fetchImpl ?? fetch)(target, {method: "GET", redirect: "error", signal: AbortSignal.timeout(d.timeoutMs ?? 10_000), headers: cfg.token ? {authorization: `Bearer ${cfg.token}`} : undefined});
  } catch { return done(P, "FAILED", "LIVE", "UNREACHABLE", "The GPU service could not be reached or timed out."); }
  if (res.status === 401 || res.status === 403) return done(P, "FAILED", "LIVE", "AUTH_REJECTED", "The GPU service rejected the token.");
  if (!res.ok) return done(P, "FAILED", "LIVE", "UPSTREAM_ERROR", `The GPU service /health responded with HTTP ${res.status}.`);
  return done(P, "LIVE_VERIFIED", "LIVE", "OK", "GPU service /health is reachable. Rendering, model licence and cost controls are NOT exercised by this test.");
}

/** Pure(ish) test runner: all I/O is injected, secrets never appear in results, and nothing is reported as working unless a real call succeeded. */
export async function runConnectionTest(provider: IntegrationProvider, d: TestDeps): Promise<TestResult> {
  const env = d.env ?? process.env;
  const row = await d.loadSetting(provider);
  if (!row) {
    if (provider === "AI_RENDER" && env.DIFFUSERS_API_URL) return probeAiRender(env.DIFFUSERS_API_URL, "env", "LIVE", d);
    return done(provider, "NOT_CONFIGURED", null, "NOT_CONFIGURED", "No credentials are stored for this provider.");
  }
  let secret: string;
  try { secret = (d.decrypt ?? decryptSecret)({payload: row.encryptedPayload, nonce: row.nonce, authTag: row.authTag}, provider); }
  catch { return done(provider, "FAILED", asMode(row.mode), "VAULT_UNREADABLE", "Stored credentials cannot be decrypted (INTEGRATION_MASTER_KEY missing, rotated or data corrupted)."); }
  const mode = asMode(row.mode);
  if (provider === "RAZORPAY") return probeRazorpay(secret, mode, d);
  if (provider === "AI_RENDER") return probeAiRender(secret, "vault", mode, d);
  return done(provider, "FAILED", mode, "NO_TEST_ADAPTER", "Credentials are stored but no verified connection test exists for this provider yet. Treat it as UNVERIFIED.");
}

export type IntegrationDto = {provider: string; mode: string; maskedSuffix: string | null; lastTestStatus: string | null; lastTestAt: string | null; updatedAt: string};

export async function listIntegrations(): Promise<IntegrationDto[]> {
  const rows = await prisma.integrationSetting.findMany({select: {provider: true, mode: true, maskedSuffix: true, lastTestStatus: true, lastTestAt: true, updatedAt: true}, orderBy: {provider: "asc"}});
  return rows.map(r => ({...r, lastTestAt: r.lastTestAt?.toISOString() ?? null, updatedAt: r.updatedAt.toISOString()}));
}

export async function testIntegration(staff: StaffIdentity, provider: IntegrationProvider): Promise<TestResult & {testedAt: string}> {
  const result = await runConnectionTest(provider, {loadSetting: p => prisma.integrationSetting.findUnique({where: {provider: p}, select: {mode: true, encryptedPayload: true, nonce: true, authTag: true}})});
  const testedAt = new Date();
  await prisma.$transaction(async tx => {
    // Persist the outcome only when a row exists; a NOT_CONFIGURED result must not create settings.
    await tx.integrationSetting.updateMany({where: {provider}, data: {lastTestStatus: result.status, lastTestAt: testedAt}});
    await writeAudit(tx, staff, "INTEGRATION_TEST_CONNECTION", provider, {status: result.status, code: result.code, mode: result.mode});
  });
  return {...result, testedAt: testedAt.toISOString()};
}
