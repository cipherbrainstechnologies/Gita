import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import {MERCH_COLLECTIONS} from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  const gate = await gateAdmin(["SUPERADMIN", "MERCHANDISER", "DESIGNER", "OPERATIONS"]);
  if (gate.state !== "ok") {
    return <AdminDenied gate={gate} area="collections" />;
  }

  return (
    <div className="page-wrap">
      <p className="kicker dark">MERCHANDISING · {gate.staff.role.replace(/_/g, " ")}</p>
      <h1 className="page-title">
        Collections<span>.</span>
      </h1>
      <p className="page-lead">
        Creative taxonomies for launch. LICENSED_POP_CULTURE lines require territorial merchandise rights before any
        customer-facing artwork.
      </p>
      <p>
        <Link href="/admin" className="text-link">
          ← COMMAND CENTER
        </Link>
      </p>
      <div className="admin-grid">
        {MERCH_COLLECTIONS.map((c) => (
          <div key={c.key}>
            <h2>{c.name}</h2>
            <p>
              {c.blurb}
              <br />
              <small>{c.sourceClasses.join(" · ")}</small>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
