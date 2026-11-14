import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import {prisma} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminContentLibrary() {
  const gate = await gateAdmin(["SUPERADMIN", "MERCHANDISER", "DESIGNER"]);
  if (gate.state !== "ok") {
    return <AdminDenied gate={gate} area="the content library" />;
  }

  let sources: Awaited<ReturnType<typeof prisma.contentSource.findMany>> = [];
  let passages: Awaited<ReturnType<typeof prisma.contentPassage.findMany>> = [];
  let dbError: string | null = null;
  try {
    sources = await prisma.contentSource.findMany({orderBy: {createdAt: "asc"}, take: 50});
    passages = await prisma.contentPassage.findMany({
      orderBy: {createdAt: "asc"},
      take: 100,
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }

  return (
    <div className="page-wrap">
      <p className="kicker dark">CONTENT / PROVENANCE · {gate.staff.role.replace(/_/g, " ")}</p>
      <h1 className="page-title">
        Content library<span>.</span>
      </h1>
      <p className="page-lead">
        Scripture sources require chapter/verse and authoritative URLs. Original editorial lines never claim to be ancient
        quotations. Unverified social screenshots stay quarantined.
      </p>
      <p>
        <Link href="/admin" className="text-link">
          ← COMMAND CENTER
        </Link>{" "}
        ·{" "}
        <Link href="/inspiration" className="text-link">
          PUBLIC VERSE LIBRARY
        </Link>
      </p>
      {dbError ? (
        <p className="notice">
          Content tables unavailable ({dbError}). Run migration `20251115030000_v2_content_library` then{" "}
          <code>npm run db:seed:v2-content</code>.
        </p>
      ) : (
        <>
          <h2 className="admin-h2">Sources ({sources.length})</h2>
          <div className="admin-grid">
            {sources.map((s) => (
              <div key={s.id}>
                <h2>{s.title}</h2>
                <p>
                  {s.category} · {s.rightsStatus}
                  {s.authoritativeUrl ? (
                    <>
                      <br />
                      <a href={s.authoritativeUrl} target="_blank" rel="noreferrer">
                        Source URL
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
            ))}
            {sources.length === 0 && <p className="notice">No sources yet. Seed V2 content JSON.</p>}
          </div>
          <h2 className="admin-h2">Passages ({passages.length})</h2>
          <div className="admin-grid">
            {passages.map((p) => (
              <div key={p.id}>
                <h2>{p.passageKey}</h2>
                <p>
                  {p.chapterVerse ?? "—"} · {p.sourceVerification}
                  <br />
                  Status: {p.publicationStatus}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
