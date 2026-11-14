import {withTimeout} from "@/lib/config";
import {formatDate} from "@/lib/format";

export const dynamic = "force-dynamic";

type Approved = {policyType: string; version: string; content: string; effectiveAt: Date | null; createdAt: Date};

/** Latest APPROVED version per policy type. null = DB unavailable; [] = none approved. Drafts are never rendered. */
async function loadApproved(): Promise<Approved[] | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const {prisma} = await import("@/lib/db");
    const rows = await withTimeout(prisma.policyVersion.findMany({
      where: {status: "APPROVED", OR: [{effectiveAt: null}, {effectiveAt: {lte: new Date()}}]},
      orderBy: [{effectiveAt: {sort: "desc", nulls: "last"}}, {createdAt: "desc"}],
      select: {policyType: true, version: true, content: true, effectiveAt: true, createdAt: true}
    }), 3000);
    const seen = new Set<string>();
    return rows.filter(r => !seen.has(r.policyType) && seen.add(r.policyType));
  } catch { return null; }
}

const title = (t: string) => t.replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

export default async function Policies() {
  const approved = await loadApproved();
  if (approved && approved.length) {
    return <div className="page-wrap legal">
      <p className="kicker dark">TRANSPARENCY FIRST</p>
      <h1 className="page-title">Policies<span>.</span></h1>
      <nav aria-label="Policies" className="filter-row">{approved.map(p => <a key={p.policyType} href={`#${p.policyType}`}>{title(p.policyType).toUpperCase()}</a>)}</nav>
      {approved.map(p => <section key={p.policyType} id={p.policyType} className="policy-section">
        <h2>{title(p.policyType)}</h2>
        <p className="policy-meta">Version {p.version} · Effective {formatDate(p.effectiveAt ?? p.createdAt)}</p>
        {/* Rendered as escaped text: policy content is never interpreted as HTML. */}
        <div className="policy-body">{p.content}</div>
      </section>)}
    </div>;
  }
  return <div className="page-wrap legal"><p className="kicker dark">TRANSPARENCY FIRST</p><h1 className="page-title">Policies<span>.</span></h1><p>VERSE//MODE is a founder preview and is not accepting orders. Customer terms, prepaid preorder cancellation terms, legal seller details, refund and return rights, shipping commitments, privacy/consent, grievance contact and GST invoice procedures are being reviewed and are not yet effective.</p><p>No order or payment should be initiated until the approved policies are published with complete company identity and support contacts.</p><p className="notice">Draft policies are under legal review and are not published here until approved.</p></div>;
}
