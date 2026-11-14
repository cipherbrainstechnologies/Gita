import Link from "next/link";
import type {GateResult} from "@/lib/admin";

/** Rendered by admin pages when `gateAdmin` did not return ok. Fail closed: no data is loaded for these states. */
export function AdminDenied({gate, area}: {gate: Exclude<GateResult, {state: "ok"}>; area: string}) {
  if (gate.state === "unavailable") {
    return <div className="page-wrap"><p className="kicker dark">{area.toUpperCase()}</p><h1 className="page-title">Unavailable<span>.</span></h1><p className="notice">Staff authorisation could not be verified because the database is unreachable. Nothing is shown and no action can be taken.</p></div>;
  }
  return <div className="page-wrap admin-locked"><p className="kicker dark">RESTRICTED</p><h1 className="page-title">Forbidden<span>.</span></h1><p>Your account is not an active staff member with access to {area}.</p><Link href="/login" className="primary-cta">STAFF SIGN IN ↗</Link></div>;
}
