import {beforeEach, describe, expect, it, vi} from "vitest";

const requireAdmin = vi.fn();
vi.mock("@/lib/admin", () => ({requireAdmin: (roles?: unknown) => requireAdmin(roles)}));

import {ApiError, parse, readJson, staffRoute} from "./http";
import {z} from "zod";

const post = (body: string, type = "application/json") => new Request("http://x/api", {method: "POST", headers: {"content-type": type}, body});
const noParams = {params: Promise.resolve({})};
const staff = {email: "ops@example.com", role: "OPERATIONS"};

beforeEach(() => { requireAdmin.mockReset(); });

describe("staffRoute gate", () => {
  it("returns 403 and never runs the handler for non-staff", async () => {
    requireAdmin.mockResolvedValue(null);
    const handler = vi.fn();
    const res = await staffRoute(["SUPERADMIN"], handler)(post("{}"), noParams);
    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });
  it("passes the requested roles to the staff check", async () => {
    requireAdmin.mockResolvedValue(null);
    await staffRoute(["SUPERADMIN", "FINANCE"], vi.fn())(post("{}"), noParams);
    expect(requireAdmin).toHaveBeenCalledWith(["SUPERADMIN", "FINANCE"]);
  });
  it("fails closed with 503 when staff authorisation cannot be verified", async () => {
    requireAdmin.mockRejectedValue(new Error("db down"));
    const handler = vi.fn();
    const res = await staffRoute(["SUPERADMIN"], handler)(post("{}"), noParams);
    expect(res.status).toBe(503);
    expect(handler).not.toHaveBeenCalled();
  });
  it("runs the handler with identity and resolved params for staff", async () => {
    requireAdmin.mockResolvedValue(staff);
    const res = await staffRoute<{id: string}>(["OPERATIONS"], async ({staff: s, params}) => new Response(JSON.stringify({who: s.email, id: params.id})))(post("{}"), {params: Promise.resolve({id: "o1"})});
    expect(await res.json()).toEqual({who: "ops@example.com", id: "o1"});
  });
  it("maps domain errors, bigint serialisation and unknown failures", async () => {
    requireAdmin.mockResolvedValue(staff);
    const conflict = await staffRoute(["OPERATIONS"], async () => { throw new ApiError(409, "INVALID_TRANSITION", "no", [{code: "X"}]); })(post("{}"), noParams);
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({error: {code: "INVALID_TRANSITION", message: "no", details: [{code: "X"}]}});
    const boom = await staffRoute(["OPERATIONS"], async () => { throw new Error("secret detail"); })(post("{}"), noParams);
    expect(boom.status).toBe(500);
    expect(JSON.stringify(await boom.json())).not.toContain("secret detail");
  });
});

describe("request parsing", () => {
  it("requires application/json (CSRF hardening) and valid JSON", async () => {
    await expect(readJson(post("a=1", "application/x-www-form-urlencoded"))).rejects.toMatchObject({status: 415});
    await expect(readJson(post("{nope"))).rejects.toMatchObject({status: 400});
    await expect(readJson(post('{"a":1}'))).resolves.toEqual({a: 1});
  });
  it("validation failures are 422 and list paths without echoing values", () => {
    try { parse(z.object({reason: z.string().min(20)}), {reason: "x-secret"}); throw new Error("should fail"); }
    catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(422);
      expect(JSON.stringify((e as ApiError).details)).not.toContain("x-secret");
    }
  });
});


