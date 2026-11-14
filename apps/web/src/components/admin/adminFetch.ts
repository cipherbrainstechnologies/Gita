"use client";

export type ApiResult<T> = {ok: true; status: number; data: T} | {ok: false; status: number; message: string; details?: {code?: string; message?: string; path?: string}[]};

/** Browser helper for the admin JSON APIs. Never reports success unless the server returned a 2xx. */
export async function adminFetch<T = Record<string, unknown>>(method: "GET" | "POST" | "PATCH" | "DELETE", url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {method, headers: body === undefined ? undefined : {"Content-Type": "application/json"}, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store"});
    const json = (await res.json().catch(() => ({}))) as {error?: string | {message?: string; details?: unknown}} & Record<string, unknown>;
    if (res.ok) return {ok: true, status: res.status, data: json as T};
    // Newer admin APIs return {error:{code,message,details}}; the original integrations route returns {error:"text"}.
    const err = typeof json.error === "object" && json.error ? json.error : undefined;
    const details = Array.isArray(err?.details) ? (err.details as {code?: string; message?: string; path?: string}[]) : undefined;
    return {ok: false, status: res.status, message: err?.message ?? (typeof json.error === "string" ? json.error : `Request failed (HTTP ${res.status}).`), details};
  } catch {
    return {ok: false, status: 0, message: "Network error. No change was made."};
  }
}

export function describeFailure(r: Extract<ApiResult<unknown>, {ok: false}>): string {
  const extra = r.details?.map(d => (d.path ? `${d.path}: ` : "") + (d.message ?? d.code ?? "")).filter(Boolean).join("; ");
  return extra ? `${r.message} ${extra}` : r.message;
}

/** "5" / "12.5" percent -> basis points, or null when malformed. */
export function percentToBasisPoints(s: string): number | null {
  const t = s.trim();
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}
