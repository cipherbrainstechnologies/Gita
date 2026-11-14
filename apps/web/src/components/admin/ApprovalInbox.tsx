"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {adminFetch, describeFailure} from "./adminFetch";
import {APPROVAL_BLOCKER_MESSAGES} from "@/modules/admin/studio/studio.rules";
import type {ApprovalDto} from "@/modules/admin/studio/studio.service";

function Card({c, demoAuth}: {c: ApprovalDto; demoAuth: boolean}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [ck, setCk] = useState({provenanceLicence: false, quoteAuthenticity: false, culturalReview: false});
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{kind: "ok" | "err"; text: string} | null>(null);
  const noteOk = note.trim().length >= 3;
  const allChecked = ck.provenanceLicence && ck.quoteAuthenticity && ck.culturalReview;
  const gateOpen = c.gate.ok || (demoAuth && demo);
  async function decide(decision: "APPROVE" | "REJECT") {
    setBusy(true); setMsg(null);
    const r = await adminFetch("POST", "/api/admin/studio/approvals", {candidateId: c.id, decision, note: note.trim(), checklist: decision === "APPROVE" ? ck : undefined, demoAllowSimulation: decision === "APPROVE" && demo ? true : undefined});
    if (r.ok) { setMsg({kind: "ok", text: decision === "APPROVE" ? "Approved. No product was published." : "Rejected."}); router.refresh(); } else setMsg({kind: "err", text: describeFailure(r)});
    setBusy(false);
  }
  const review = c.automatedReview ? JSON.stringify(c.automatedReview).slice(0, 400) : null;
  return <article className="admin-card">
    <p className="admin-quote">“{c.quoteText}”</p>
    <p><small>{c.theme} · {c.garmentFamily} · {c.artFamily} · queued {c.createdAt.slice(0, 10)}</small>{c.similarityFlag && <b className="admin-warn"> · SIMILARITY FLAG</b>}</p>
    {c.version ? <p><small>rev {c.version.revision} · model {c.version.modelName ?? "n/a"} · licence {c.version.modelLicense ?? "n/a"} / output {c.version.outputLicense ?? "n/a"} · status {c.version.approvalStatus}</small>{c.version.isSimulation && <b className="admin-warn"> · SIMULATION ONLY</b>}</p> : <p><small>No artwork version recorded.</small></p>}
    {review && <p><small>Automated review: {review}</small></p>}
    {!c.gate.ok && <ul className="admin-blockers">{c.gate.blockers.map(b => <li key={b}>{APPROVAL_BLOCKER_MESSAGES[b]}</li>)}</ul>}
    <div className="admin-form">
      <label>Reviewer note (required)<input value={note} onChange={e => setNote(e.target.value)} maxLength={1000} placeholder="Provenance, licence, grammar, cultural check…" /></label>
      <label className="check"><input type="checkbox" checked={ck.provenanceLicence} onChange={e => setCk({...ck, provenanceLicence: e.target.checked})} />Provenance and model/output licence reviewed</label>
      <label className="check"><input type="checkbox" checked={ck.quoteAuthenticity} onChange={e => setCk({...ck, quoteAuthenticity: e.target.checked})} />Quote is original or correctly sourced (no invented scripture)</label>
      <label className="check"><input type="checkbox" checked={ck.culturalReview} onChange={e => setCk({...ck, culturalReview: e.target.checked})} />Cultural / grammar review done</label>
      {!c.gate.ok && demoAuth && <label className="check"><input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)} />DEMO ONLY: approve despite the blockers above</label>}
      <div className="admin-actions">
        <button type="button" className="primary-cta button" disabled={busy || !noteOk || !allChecked || !gateOpen} onClick={() => decide("APPROVE")}>APPROVE DESIGN</button>
        <button type="button" className="button-outline small" disabled={busy || !noteOk} onClick={() => decide("REJECT")}>REJECT</button>
      </div>
      {msg && <output className={msg.kind === "err" ? "admin-error" : "admin-ok"} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</output>}
    </div>
  </article>;
}

export default function ApprovalInbox({candidates, demoAuth}: {candidates: ApprovalDto[]; demoAuth: boolean}) {
  if (candidates.length === 0) return <p className="notice">Inbox empty: no candidates are waiting for human review.</p>;
  return <div className="admin-stack">{candidates.map(c => <Card key={c.id} c={c} demoAuth={demoAuth} />)}</div>;
}
