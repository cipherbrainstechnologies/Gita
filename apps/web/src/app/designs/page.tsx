import Link from "next/link";
import {queryCatalogPage} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";

export const dynamic = "force-dynamic";

/** Full concept archive — includes styles not yet hero-ready for the curated shop grid. */
export default async function DesignsArchive({
  searchParams,
}: {
  searchParams: Promise<{page?: string}>;
}) {
  const sp = await searchParams;
  const pageNum = Number.parseInt(sp.page ?? "1", 10) || 1;
  const page = await queryCatalogPage({page: pageNum, pageSize: 30, sort: "newest"});
  const products = page?.items ?? [];
  const totalPages = page ? Math.max(1, Math.ceil(page.total / page.pageSize)) : 1;

  return (
    <div className="page-wrap shop-fashion">
      <p className="kicker dark">DESIGN ARCHIVE</p>
      <h1 className="page-title">
        All concepts<span>.</span>
      </h1>
      <p className="page-lead">
        Every creative brief in the 1,000-style library — including pieces still awaiting licensed on-model photography.
        The main <Link href="/shop">shop</Link> prioritises hero-ready previews first.
      </p>
      <div className="product-grid product-grid-fashion">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      <nav className="pagination-row" aria-label="Archive pages">
        {pageNum > 1 && (
          <Link className="text-link" href={`/designs?page=${pageNum - 1}`}>
            ← Previous
          </Link>
        )}
        <span>
          Page {pageNum} of {totalPages}
        </span>
        {pageNum < totalPages && (
          <Link className="text-link" href={`/designs?page=${pageNum + 1}`}>
            Next →
          </Link>
        )}
      </nav>
    </div>
  );
}