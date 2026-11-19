import Link from "next/link";
import {queryCatalogPage} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured =
    (await queryCatalogPage({pageSize: 8, sort: "featured", page: 1}))?.items.filter((p) => p.media?.length).slice(0, 8) ??
    [];
  const hero = featured.slice(0, 2);

  return (
    <>
      <section className="hero hero-fashion">
        <div className="hero-left">
          <div className="kicker">DROP 001 · VERSE-LED STREETWEAR</div>
          <h1>
            WEAR
            <br />
            THE <em>WORDS</em>
            <br />
            YOU LIVE BY.
          </h1>
          <p>
            Original tees and track pants for India — premium cuts, honest previews, and preorders only when manufacturing
            is real.
          </p>
          <div className="hero-buttons">
            <Link className="primary-cta" href="/shop">
              SHOP THE COLLECTION ↗
            </Link>
            <span>
              MADE AFTER YOU
              <br />
              PREORDER.
            </span>
          </div>
        </div>
        <div className="hero-art hero-art-fashion">
          {hero[0]?.media?.[0] ? (
            <div className="hero-product-stack">
              {hero.map((p) =>
                p.media?.[0] ? (
                  <Link key={p.slug} href={`/shop/${p.slug}`} className="hero-product-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.media[0].src} alt={p.media[0].alt} width={320} height={400} loading="eager" />
                    <span>{p.name}</span>
                  </Link>
                ) : null,
              )}
            </div>
          ) : (
            <>
              <div className="visual-overlay">STREETWEAR / WITH MEANING</div>
              <div className="hero-type">
                NOT
                <br />
                JUST
                <br />
                <span>FABRIC.</span>
              </div>
            </>
          )}
        </div>
      </section>
      <div className="marquee">
        <div>ORIGINAL ARTWORK · HONEST PREORDER · NO FAKE STOCK &nbsp; ✳ &nbsp; </div>
      </div>
      <section className="intro">
        <div>
          <p className="kicker dark">INDIA-FIRST APPAREL</p>
          <h2>
            Fashion first.
            <br />
            <em>Verse</em> second — together.
          </h2>
        </div>
        <p>
          Each piece pairs contemporary garment design with meaningful words — Gita-inspired discipline, campus humour,
          gym focus and multilingual originals. Browse 1,000+ concepts; only approved styles accept payment.
        </p>
      </section>
      <section className="collection-section">
        <div className="section-head">
          <div>
            <span className="kicker dark">FEATURED LOOKS</span>
            <h2>
              Curated <span>previews</span>
            </h2>
          </div>
          <Link href="/shop" className="text-link">
            FULL SHOP ↗
          </Link>
        </div>
        <div className="product-grid product-grid-fashion">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
      <section className="manifesto" id="how">
        <span className="kicker">PREORDER IN 3 STEPS</span>
        <h2>
          LOVE IT.
          <br />
          REQUEST OR PREORDER.
          <br />
          <span>WE MAKE IT.</span>
        </h2>
        <div className="steps">
          <div>
            <b>01 / DISCOVER</b>
            <p>Pick a tee or track pant with artwork you connect with.</p>
          </div>
          <div>
            <b>02 / COMMIT</b>
            <p>Request interest (no pay) or place a deposit when a SKU is open.</p>
          </div>
          <div>
            <b>03 / RECEIVE</b>
            <p>Manufacture, QC and ship with transparent updates.</p>
          </div>
          <div>
            <b>+ HONESTY</b>
            <p>
              <Link href="/how-preorder-works" className="text-link" style={{color: "var(--lime)"}}>
                Read how it works ↗
              </Link>
            </p>
          </div>
        </div>
      </section>
      <section className="closing">
        <p>VERSE//MODE</p>
        <h2>
          A wardrobe with <em>intention.</em>
        </h2>
        <Link href="/shop" className="primary-cta">
          BROWSE STYLES ↗
        </Link>
      </section>
    </>
  );
}