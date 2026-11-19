import Link from "next/link";
import {Suspense} from "react";
import {queryCatalogPage, type CatalogQueryInput, type CatalogSort} from "@/lib/catalog";
import {getCatalogProducts} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";
import {ShopCategoryChips} from "@/components/ShopCategoryChips";
import {ShopMobileBar} from "@/components/ShopMobileBar";

export const dynamic = "force-dynamic";

const THEMES = ["FOCUS", "AMBITION", "DISCIPLINE", "GRATITUDE", "COURAGE", "RESET"];
const SORTS: {value: CatalogSort; label: string}[] = [
  {value: "featured", label: "Featured"},
  {value: "newest", label: "Newest"},
  {value: "price-asc", label: "Price low"},
  {value: "price-desc", label: "Price high"},
];

function parseSort(raw?: string): CatalogSort | undefined {
  if (raw === "newest" || raw === "price-asc" || raw === "price-desc" || raw === "featured") return raw;
  return undefined;
}

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    page?: string;
    theme?: string;
    fit?: string;
    audience?: string;
    palette?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const query: CatalogQueryInput = {
    category: sp.category,
    theme: sp.theme,
    fit: sp.fit,
    audienceFit: sp.audience,
    palette: sp.palette,
    sort: parseSort(sp.sort) ?? "featured",
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
  const products = page.items;
  const live = page.orderableOnPage > 0 || products.some((p) => p.orderable);
  const heroReady = products.filter((p) => p.displaySaleReady && p.media?.length).length;
  const totalPages = Math.max(1, Math.ceil(page.total / page.pageSize));
  const qs = (nextPage: number) => {
    const p = new URLSearchParams();
    if (sp.category) p.set("category", sp.category);
    if (sp.theme) p.set("theme", sp.theme);
    if (sp.fit) p.set("fit", sp.fit);
    if (sp.audience) p.set("audience", sp.audience);
    if (sp.palette) p.set("palette", sp.palette);
    if (sp.sort && sp.sort !== "featured") p.set("sort", sp.sort);
    if (sp.q) p.set("q", sp.q);
    if (nextPage > 1) p.set("page", String(nextPage));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="page-wrap shop-fashion">
      <p className="kicker dark">{live ? "PREORDER OPEN · SELECT STYLES" : "PREORDER-FIRST APPAREL · INDIA"}</p>
      <h1 className="page-title">
        Shop<span>.</span>
      </h1>
      <p className="page-lead">
        {page.total || products.length} original tee and track-pant concepts with distinct verse-led artwork.{" "}
        {heroReady > 0
          ? `${heroReady} looks on this page carry approved storefront previews.`
          : "Browse concepts — hero photography expands as media QA approves each style."}
      </p>

      <ShopCategoryChips activeCategory={sp.category} />

      <form className="filter-row shop-filters shop-filters-desktop" action="/shop" method="get">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Search name, theme, words" aria-label="Search catalog" />
        <select name="theme" defaultValue={sp.theme ?? ""} aria-label="Theme">
          <option value="">All themes</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort ?? "featured"} aria-label="Sort">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {sp.category ? <input type="hidden" name="category" value={sp.category} /> : null}
        <button type="submit" className="button">
          Apply
        </button>
      </form>

      <p className="shop-results-count" aria-live="polite">
        {page.total} results
        {sp.category ? ` · ${sp.category}` : ""}
      </p>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No pieces match these filters.</p>
          <Link href="/shop" className="button-outline">
            Clear filters
          </Link>
          <Link href="/shop?category=tees" className="text-link">
            Browse tees
          </Link>
        </div>
      ) : (
        <div className="product-grid product-grid-fashion">{products.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
      )}

      <nav className="pagination-row" aria-label="Catalog pages">
        {page.page > 1 && (
          <Link className="text-link" href={`/shop${qs(page.page - 1)}`}>
            ← Previous
          </Link>
        )}
        <span>
          Page {page.page} of {totalPages}
        </span>
        {page.page < totalPages && (
          <Link className="text-link" href={`/shop${qs(page.page + 1)}`}>
            Next →
          </Link>
        )}
      </nav>

      <Suspense fallback={null}>
        <ShopMobileBar total={page.total} />
      </Suspense>
    </div>
  );
}