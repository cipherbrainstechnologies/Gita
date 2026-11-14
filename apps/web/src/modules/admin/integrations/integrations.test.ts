import {describe, expect, it, vi} from "vitest";
import {runConnectionTest, type SettingBlob, type TestDeps} from "./integrations.service";

const blob = (mode: string): SettingBlob => ({mode, encryptedPayload: "x", nonce: "y", authTag: "z"});
const deps = (row: SettingBlob | null, secret: string | (() => string), extra: Partial<TestDeps> = {}): TestDeps => ({
  loadSetting: async () => row,
  decrypt: typeof secret === "function" ? secret : () => secret,
  env: {},
  ...extra
});
const res = (status: number) => vi.fn(async () => new Response("{}", {status})) as unknown as typeof fetch;
const rzp = (keyId: string) => JSON.stringify({keyId, keySecret: "secretsecret"});
const publicLookup = async () => [{address: "93.184.216.34"}];

describe("integration test-connection", () => {
  it("reports NOT_CONFIGURED when nothing is stored, without any network call", async () => {
    const fetchImpl = res(200);
    const r = await runConnectionTest("RAZORPAY", deps(null, "", {fetchImpl}));
    expect(r.status).toBe("NOT_CONFIGURED");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("never invents success for providers that have no test adapter", async () => {
    const fetchImpl = res(200);
    for (const p of ["SHIPROCKET", "WHATSAPP", "SMS", "EMAIL"] as const) {
      const r = await runConnectionTest(p, deps(blob("LIVE"), "some-opaque-secret", {fetchImpl}));
      expect(r).toMatchObject({status: "FAILED", code: "NO_TEST_ADAPTER"});
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("FAILED when the vault cannot decrypt", async () => {
    const r = await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), () => { throw new Error("bad key"); }));
    expect(r).toMatchObject({status: "FAILED", code: "VAULT_UNREADABLE"});
    expect(JSON.stringify(r)).not.toContain("bad key");
  });
  it("razorpay: rejects wrong secret shape, bad prefix and mode mismatch before calling out", async () => {
    const fetchImpl = res(200);
    expect(await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), "plain-string", {fetchImpl}))).toMatchObject({status: "FAILED", code: "CREDENTIAL_SHAPE"});
    expect(await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("abc_123456"), {fetchImpl}))).toMatchObject({status: "FAILED", code: "KEY_PREFIX"});
    expect(await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_live_abcdef"), {fetchImpl}))).toMatchObject({status: "FAILED", code: "MODE_MISMATCH"});
    expect(await runConnectionTest("RAZORPAY", deps(blob("LIVE"), rzp("rzp_test_abcdef"), {fetchImpl}))).toMatchObject({status: "FAILED", code: "MODE_MISMATCH"});
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("razorpay: test key accepted => SANDBOX; live key accepted => LIVE_VERIFIED", async () => {
    expect(await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_test_abcdef"), {fetchImpl: res(200)}))).toMatchObject({status: "SANDBOX", mode: "SANDBOX"});
    expect(await runConnectionTest("RAZORPAY", deps(blob("LIVE"), rzp("rzp_live_abcdef"), {fetchImpl: res(200)}))).toMatchObject({status: "LIVE_VERIFIED", mode: "LIVE"});
  });
  it("razorpay: 401, 500 and network errors are FAILED and never leak secrets", async () => {
    const r401 = await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_test_abcdef"), {fetchImpl: res(401)}));
    expect(r401).toMatchObject({status: "FAILED", code: "AUTH_REJECTED"});
    expect(await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_test_abcdef"), {fetchImpl: res(500)}))).toMatchObject({status: "FAILED", code: "UPSTREAM_ERROR"});
    const boom = vi.fn(async () => { throw new Error("secretsecret leaked"); }) as unknown as typeof fetch;
    const net = await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_test_abcdef"), {fetchImpl: boom}));
    expect(net).toMatchObject({status: "FAILED", code: "UNREACHABLE"});
    expect(JSON.stringify([r401, net])).not.toMatch(/secretsecret|rzp_test_abcdef/);
  });
  it("razorpay probe sends Basic auth to the fixed Razorpay host only", async () => {
    const fetchImpl = res(200);
    await runConnectionTest("RAZORPAY", deps(blob("SANDBOX"), rzp("rzp_test_abcdef"), {fetchImpl}));
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url.startsWith("https://api.razorpay.com/")).toBe(true);
    expect(init.method).toBe("GET");
    expect(init.redirect).toBe("error");
  });
  it("ai_render: SANDBOX mode is reported without contacting the endpoint", async () => {
    const fetchImpl = res(200);
    const r = await runConnectionTest("AI_RENDER", deps(blob("SANDBOX"), "https://gpu.example.com", {fetchImpl, lookup: publicLookup, env: {PROVIDER_ALLOWED_HOSTS: "gpu.example.com"}}));
    expect(r).toMatchObject({status: "SANDBOX", code: "SANDBOX_NOT_CONTACTED"});
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("ai_render LIVE: allowlisted public host is probed via /health; non-allowlisted or private hosts are blocked", async () => {
    const fetchImpl = res(200);
    const ok = await runConnectionTest("AI_RENDER", deps(blob("LIVE"), "https://gpu.example.com", {fetchImpl, lookup: publicLookup, env: {PROVIDER_ALLOWED_HOSTS: "gpu.example.com"}}));
    expect(ok).toMatchObject({status: "LIVE_VERIFIED"});
    expect(String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toBe("https://gpu.example.com/health");
    const blockedFetch = res(200);
    expect(await runConnectionTest("AI_RENDER", deps(blob("LIVE"), "https://evil.example.net", {fetchImpl: blockedFetch, lookup: publicLookup, env: {PROVIDER_ALLOWED_HOSTS: "gpu.example.com"}}))).toMatchObject({status: "FAILED", code: "BLOCKED_ENDPOINT"});
    expect(await runConnectionTest("AI_RENDER", deps(blob("LIVE"), "https://gpu.example.com", {fetchImpl: blockedFetch, lookup: async () => [{address: "10.0.0.5"}], env: {PROVIDER_ALLOWED_HOSTS: "gpu.example.com"}}))).toMatchObject({status: "FAILED", code: "BLOCKED_ENDPOINT"});
    expect(blockedFetch).not.toHaveBeenCalled();
  });
  it("ai_render: env DIFFUSERS_API_URL is tested when nothing is stored; /health failure is FAILED", async () => {
    const r = await runConnectionTest("AI_RENDER", deps(null, "", {fetchImpl: res(503), lookup: publicLookup, env: {DIFFUSERS_API_URL: "https://gpu.example.com"}}));
    expect(r).toMatchObject({status: "FAILED", code: "UPSTREAM_ERROR"});
  });
});
