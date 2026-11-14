import Link from "next/link";
import {queryCatalogPage, type CatalogQueryInput} from "@/lib/catalog";
import {getCatalogProducts} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const THEMES = ["FOCUS", "AMBITION", "DISCIPLINE", "GRATITUDE", "COURAGE", "RESET"];

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{category?: string; page?: string; theme?: string; fit?: string; audience?: string; q?: string}>;
}) {
  const sp = await searchParams;
  const query: CatalogQueryInput = {
    category: sp.category,
    theme: sp.theme,
    fit: sp.fit,
    audienceFit: sp.audience,
    q: sp.q,
    page: Number.parseInt(sp.page ?? "1", 10) || 1,
    pageSize: 30,
  };
  const page = (await queryCatalogPage(query)) ?? {
    items: await getCatalogProducts(),
    total: 0,
    page: 1,
    pageSize: 30,
    orderableOnPage: 0,
  };
  const products = page.items.filter((x) => (query.category ? x.category === query.category : true));
  const live = page.orderableOnPage > 0 || products.some((p) => p.orderable);
  const totalPages = Math.max(1, Math.ceil(page.total / page.pageSize));
  const qs = (nextPage: number) => {
    const p = new URLSearchParams();
    if (sp.category) p.set("category", sp.category);
    if (sp.theme) p.set("theme", sp.theme);
    if (sp.fit) p.set("fit", sp.fit);
    if (sp.audience) p.set("audience", sp.audience);
    if (sp.q) p.set("q", sp.q);
    if (nextPage > 1) p.set("page", String(nextPage));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="page-wrap">
      <p className="kicker dark">{live ? "PREORDER OPEN FOR SELECTED PIECES" : "THE CONCEPT ARCHIVE / NOTHING FOR SALE YET"}</p>
      <h1 className="page-title">
        All the ideas<span>.</span>
      </h1>
      <p className="page-lead">
        {page.total || products.length} design concepts in the archive. Paginated {page.pageSize} per page — editorial drafts are
        not scripture and cannot be purchased until supplier, imagery and legal gates pass.
      </p>
      <form className="filter-row shop-filters" action="/shop" method="get">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search title or theme" aria-label="Search catalog" />
        <select name="theme" defaultValue={sp.theme ?? ""} aria-label="Theme">
          <option value="">ALL THEMES</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="audience" defaultValue={sp.audience ?? ""} aria-label="Fit audience">
          <option value="">ALL FIT AUDIENCES</option>
          <option value="ADULT_UNISEX">UNISEX</option>
          <option value="ADULT_MEN">MEN</option>
          <option value="ADULT_WOMEN">WOMEN</option>
        </select>
        <button type="submit" className="button">
          FILTER
        </button>
      </form>
      <div className="filter-row">
        <Link className={!sp.category ? "active" : ""} href="/shop">
          EVERYTHING
        </Link>
        <Link className={sp.category === "tees" ? "active" : ""} href="/shop?category=tees">
          TEES
        </Link>
        <Link className={sp.category === "pants" ? "active" : ""} href="/shop?category=pants">
          TRACK PANTS
        </Link>
      </div>
      <div className="product-grid">{products.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
      <nav className="pagination-row" aria-label="Catalog pages">
        {page.page > 1 && (
          <Link className="text-link" href={`/shop${qs(page.page - 1)}`}>
            ← PREVIOUS
          </Link>
        )}
        <span>
          Page {page.page} of {totalPages} ({page.total} concepts)
        </span>
        {page.page < totalPages && (
          <Link className="text-link" href={`/shop${qs(page.page + 1)}`}>
            NEXT →
          </Link>
        )}
      </nav>
    </div>
  );
}