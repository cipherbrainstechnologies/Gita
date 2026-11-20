import {notFound} from "next/navigation";
import Link from "next/link";
import type {Metadata} from "next";
import {getProductBySlug, isSaleable, queryCatalogPage} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {productJsonLd} from "@/lib/seo/product-jsonld";
import {auth} from "@/auth";
import {AddToCart} from "@/components/AddToCart";
import {GarmentArt} from "@/components/GarmentArt";
import {OnModelProductGallery} from "@/components/OnModelProductGallery";
import {EditorialGallery} from "@/components/EditorialGallery";
import {ProductInterestForm} from "@/components/ProductInterestForm";
import {PdpAccordions} from "@/components/PdpAccordions";
import {PdpStickyBar} from "@/components/PdpStickyBar";
import {ProductCard} from "@/components/ProductCard";
import {demoActive, demoAuthEnabled} from "@/lib/demo";

export const dynamic = "force-dynamic";

const siteBase =
  process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "https://web-production-b2b81db7.up.railway.app";

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {title: "Product not found | VERSE//MODE"};
  const ogImage = p.media?.find((m) => m.view === "front")?.src ?? p.media?.[0]?.src;
  return {
    title: `${p.name} | VERSE//MODE`,
    description: p.designExplanation ?? p.line,
    alternates: {canonical: `${siteBase}/shop/${slug}`},
    openGraph: {
      title: p.name,
      description: p.line,
      url: `${siteBase}/shop/${slug}`,
      type: "website",
      ...(ogImage ? {images: [{url: ogImage.startsWith("http") ? ogImage : `${siteBase}${ogImage}`}]} : {}),
    },
    robots: p.orderable ? {index: true, follow: true} : {index: true, follow: true},
  };
}

export default async function Product({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const buy = isSaleable(p, checkoutEnabled());
  const signedIn = buy ? Boolean((await auth())?.user?.email) : false;
  const q = (size: string) =>
    `/checkout?product=${encodeURIComponent(p.slug)}&size=${encodeURIComponent(size)}`;
  const hasMedia = Boolean(p.media?.length);
  const defaultSize = p.sizes[0] ?? "M";
  const showDemoCredentials = demoAuthEnabled();

  const related =
    (
      await queryCatalogPage({
        category: p.category,
        pageSize: 4,
        sort: "featured",
      })
    )?.items.filter((x) => x.slug !== p.slug).slice(0, 3) ?? [];

  const jsonLd = productJsonLd(p, siteBase);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="pdp page-wrap pdp-upgraded pdp-fashion">
          <div className="pdp-gallery">
            {hasMedia && p.media ? (
              p.source === "db" ? (
                <OnModelProductGallery images={p.media} productName={p.name} disclosure={p.disclosure} />
              ) : (
                <EditorialGallery images={p.media} productName={p.name} />
              )
            ) : (
              <div className="photo-empty-state">
                <span className="pdp-mini-label">Concept preview</span>
                <h2>{p.line}</h2>
                <p>This design is browsable in the archive. Storefront hero photography is added after media QA — not before.</p>
                <div className="pdp-image" aria-hidden>
                  <GarmentArt product={p} large />
                </div>
                <Link href="/designs" className="text-link">
                  Browse design archive
                </Link>
              </div>
            )}
          </div>

          <div className="pdp-info">
            {demoActive() && showDemoCredentials && (
              <p className="notice demo-note" role="note">
                <b>Demo environment.</b> Credentials and test data only — not a live store.
              </p>
            )}
            <p className="kicker dark">
              {p.collection || "VERSE//MODE"} · {buy ? "Preorder open" : p.displaySaleReady ? "Design preview" : "Concept"}
            </p>
            <h1>{p.name}</h1>
            <p className="pdp-garment-type">{p.category === "pants" ? "Track pant / jogger" : "Designer tee"} · {p.fit}</p>
            <p className="pdp-line">“{p.line}”</p>
            {p.verseReference && (
              <p className="pdp-source">
                Inspired by{" "}
                {p.sourceUrl ? (
                  <a href={p.sourceUrl} target="_blank" rel="noreferrer">
                    {p.verseReference}
                  </a>
                ) : (
                  p.verseReference
                )}{" "}
                · modern editorial interpretation
              </p>
            )}

            <div className="pdp-colour-row">
              <span
                className="colour-swatch colour-swatch-lg"
                style={{background: paletteCss(p.palette)}}
                aria-hidden
              />
              <span>{p.palette.replace(/-/g, " ")} colourway</span>
            </div>

            {p.priceInr !== null && (
              <p className="price-big">
                ₹{p.priceInr.toLocaleString("en-IN")}{" "}
                <small>
                  {buy
                    ? "preorder · deposit shown at checkout"
                    : "illustrative target — no payment on this page"}
                </small>
              </p>
            )}

            <div className="product-configuration">
              <strong>Size</strong>
              {p.sizes.length > 0 ? (
                buy ? (
                  <div className="pdp-size-pills pdp-size-pills-selectable">
                    {p.sizes.map((s) => (
                      <Link key={s} href={q(s)} className="size-chip">
                        {s}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="pdp-size-pills">
                    {p.sizes.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                )
              ) : (
                <p>Sizes listed after supplier grading.</p>
              )}
              <Link href="/size-chart" className="text-link">
                Size guide
              </Link>
            </div>

            {buy ? (
              <>
                <Link className="primary-cta" href={q(defaultSize)}>
                  Preorder
                </Link>
                <AddToCart slug={p.slug} sizes={p.sizes} signedIn={signedIn} />
              </>
            ) : (
              <div id="request-design">
                <ProductInterestForm slug={p.slug} sizes={p.sizes} productName={p.name} />
              </div>
            )}

            <PdpAccordions product={p} />

            {related.length > 0 && (
              <section className="pdp-related" aria-labelledby="related-heading">
                <h2 id="related-heading" className="sub-title">
                  Style with
                </h2>
                <div className="product-grid product-grid-fashion product-grid-related">
                  {related.map((r) => (
                    <ProductCard key={r.slug} product={r} />
                  ))}
                </div>
              </section>
            )}

            <div className="pdp-links">
              <Link href="/how-preorder-works" className="text-link">
                How preorder works
              </Link>
              <Link href="/shop" className="text-link">
                ← Back to shop
              </Link>
            </div>
          </div>
      </div>
      <PdpStickyBar
        buy={buy}
        priceInr={p.priceInr}
        slug={p.slug}
        defaultSize={defaultSize}
        label={p.name}
      />
    </>
  );
}

function paletteCss(palette: string): string {
  const map: Record<string, string> = {
    charcoal: "#1a1a1a",
    sand: "#d6cbb8",
    slate: "#475569",
    olive: "#556b2f",
    clay: "#b96952",
    "muted-lilac": "#7c6bae",
    bone: "#f5f1e9",
    cobalt: "#1e3a8a",
    sage: "#4d7c5f",
    rust: "#b45309",
    lavender: "#7c6bae",
  };
  return map[palette] ?? "#242629";
}
