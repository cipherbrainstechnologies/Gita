import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import ApprovalInbox from "@/components/admin/ApprovalInbox";
import {StatusChip} from "@/components/admin/StatusChip";
import StudioControls from "@/components/StudioControls";
import {PERMISSIONS, demoAuth} from "@/modules/admin/shared/permissions";
import {listApprovals, listJobs, type ApprovalDto, type JobDto} from "@/modules/admin/studio/studio.service";

export const dynamic = "force-dynamic";

export default async function Studio() {
  const gate = await gateAdmin(PERMISSIONS.studio);
  if (gate.state !== "ok") return <AdminDenied gate={gate} area="the design studio" />;
  let jobs: JobDto[] | null = null, inbox: ApprovalDto[] | null = null;
  try { [jobs, inbox] = await Promise.all([listJobs(30), listApprovals(50)]); } catch { jobs = null; inbox = null; }
  return <div className="page-wrap">
    <p className="kicker dark">CREATIVE PRODUCTION / INTERNAL</p>
    <h1 className="page-title">Design studio<span>.</span></h1>
    <p className="page-lead">Generate or assemble draft concepts in bounded batches. This worker does not pretend an external image model is connected. All outputs require review and real print proofs; approving a design never publishes a product.</p>
    <StudioControls />

    <h2 className="admin-h2">Jobs</h2>
    {jobs === null ? <p className="notice">Database unavailable. No job data can be shown.</p> : jobs.length === 0 ? <p className="notice">No jobs have been queued yet.</p> :
      <div className="admin-scroll"><table className="admin-table"><thead><tr><th>JOB</th><th>STATUS</th><th>PROGRESS</th><th>QUEUED</th><th>NOTE</th></tr></thead><tbody>
        {jobs.map(j => <tr key={j.id}><td><small>{j.kind}</small><br /><small>{j.id}</small></td><td><StatusChip status={j.status} label={j.status.replace(/_/g, " ")} /></td><td>{j.processed}/{j.total}</td><td>{j.createdAt.slice(0, 16).replace("T", " ")} UTC</td><td><small>{j.error ?? "—"}</small></td></tr>)}
      </tbody></table></div>}

    <h2 className="admin-h2">Approval inbox {inbox ? `(${inbox.length})` : ""}</h2>
    {inbox === null ? <p className="notice">Database unavailable. No candidates can be shown.</p> : <ApprovalInbox candidates={inbox} demoAuth={demoAuth()} />}
    <p className="notice">Approval needs real (non-simulation) artwork plus the full provenance / authenticity / cultural checklist. The decision and your note are stored in the candidate’s review record and the audit log. Next steps after approval (supplier proof, catalog product) are separate, explicit actions.</p>
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
