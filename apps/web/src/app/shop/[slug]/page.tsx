import {notFound} from "next/navigation";
import Link from "next/link";
import {getProductBySlug, isSaleable} from "@/lib/catalog";
import {checkoutEnabled} from "@/lib/config";
import {auth} from "@/auth";
import {AddToCart} from "@/components/AddToCart";
import {GarmentArt} from "@/components/GarmentArt";
import {DemoBanner} from "@/components/DemoBanner";
import {OnModelProductGallery} from "@/components/OnModelProductGallery";
import {EditorialGallery} from "@/components/EditorialGallery";

export const dynamic = "force-dynamic";

export default async function Product({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const buy = isSaleable(p, checkoutEnabled());
  const signedIn = buy ? Boolean((await auth())?.user?.email) : false;
  const q = (size: string) =>
    `/checkout?product=${encodeURIComponent(p.slug)}&size=${encodeURIComponent(size)}`;
  const hasMedia = Boolean(p.media?.length);

  return (
    <div className="pdp page-wrap pdp-upgraded">
      <div className="pdp-gallery">
        {hasMedia && p.media ? (
          p.source === "db" ? (
            <OnModelProductGallery images={p.media} productName={p.name} disclosure={p.disclosure} />
          ) : (
            <EditorialGallery images={p.media} productName={p.name} />
          )
        ) : (
          <div className="photo-empty-state">
            <span className="pdp-mini-label">PRODUCT IMAGERY NOT APPROVED</span>
            <h2>{p.line}</h2>
            <p>
              This design brief needs a front photo, back photo, fabric close-up, on-model fit image
              and print proof before it can become a purchasable product. SVG concept art is not
              saleable merchandise.
            </p>
            <div className="pdp-image" aria-hidden>
              <GarmentArt product={p} large />
            </div>
            <Link href="/shop/karma-action-oversized-tee" className="text-link">
              VIEW PHOTOGRAPHY DIRECTION
            </Link>
          </div>
        )}
      </div>

      <div className="pdp-info">
        <DemoBanner />
        <p className="kicker dark">
          {p.collection} / {buy ? "PREORDER" : "DESIGN CONCEPT"}
        </p>
        <h1>{p.name}</h1>
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
            · modern editorial interpretation, not a verbatim translation
          </p>
        )}

        {p.priceInr !== null && (
          <p className="price-big">
            ₹{p.priceInr.toLocaleString("en-IN")}{" "}
            <small>
              {buy
                ? "preorder price; taxes and shipping are itemised at checkout"
                : "illustrative target only — no payment accepted"}
            </small>
          </p>
        )}

        <div className="product-configuration">
          <strong>FIT</strong>
          <p>{p.fit || "Fit pending supplier grading."}</p>
          <strong>{buy ? "CHOOSE SIZE" : "PROPOSED SIZES"}</strong>
          {p.sizes.length > 0 ? (
            buy ? (
              <div className="filter-row">
                {p.sizes.map((s) => (
                  <Link key={s} href={q(s)}>
                    {s}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="pdp-size-pills">
                {p.sizes.map((s) => (
                  <span key={s} title="Proposed size only">
                    {s}
                  </span>
                ))}
              </div>
            )
          ) : (
            <p>Sizes not listed until manufacturer grading is signed.</p>
          )}
          <p className="small-note">
            Actual garment measurements and grading require signed supplier specifications.
          </p>
        </div>

        <div className="info-block">
          <b>FABRIC & CONSTRUCTION</b>
          <p>
            {p.fabricTarget ??
              "Material composition, fabric weight, yarn type, stitching, shrinkage, dye fastness, printing method and care label are not yet confirmed."}
          </p>
        </div>

        <div className="info-block">
          <b>ARTWORK & MEDIA</b>
          <p>
            {hasMedia
              ? p.designExplanation ??
                "Generated on-model product imagery for silhouette and print placement. It does not prove factory sample fit, fabric quality, print fidelity or supplier readiness."
              : "Print file, on-model photography and close-up product images are missing."}
          </p>
          {hasMedia && p.media && (
            <ul className="media-view-checklist">
              {(["front", "back", "side", "detail", "on-model", "print-proof"] as const).map((v) => {
                const hit = p.media!.some((m) => m.view === v || (v === "on-model" && m.view === "combined"));
                return (
                  <li key={v} data-present={hit ? "yes" : "no"}>
                    {hit ? "✓" : "○"} {v.toUpperCase()}
                    {hit ? " (model preview)" : " missing — manufacturer/photo gate"}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="info-block">
          <b>PREORDER STATUS</b>
          <p>
            {buy
              ? "Preorder is open. Made after you order; dispatch window is confirmed at checkout."
              : "Not open. No supplier-approved capacity, production ETA, dispatch date or returns setup has been established."}
          </p>
        </div>

        {buy ? (
          <>
            <Link className="primary-cta" href={q(p.sizes[0] ?? "M")}>
              PREORDER
            </Link>
            <AddToCart slug={p.slug} sizes={p.sizes} signedIn={signedIn} />
          </>
        ) : (
          <>
            <button className="disabled-cta" disabled type="button">
              COMING SOON — NOT AVAILABLE FOR PURCHASE
            </button>
            <Link className="button-outline" href={q(p.sizes[0] ?? "M")}>
              JOIN THE WAITLIST
            </Link>
          </>
        )}

        <div className="pdp-links">
          <Link href="/inspiration" className="text-link">
            EXPLORE THE VERSE LIBRARY
          </Link>
          <Link href="/size-chart" className="text-link">
            SIZE CHART
          </Link>
          <Link href="/shop" className="text-link">
            ← BACK TO COLLECTION
          </Link>
        </div>
      </div>
    </div>
  );
}
