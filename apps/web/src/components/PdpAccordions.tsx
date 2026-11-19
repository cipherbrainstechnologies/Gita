import Link from "next/link";
import type {CatalogProduct} from "@/lib/catalog";

export function PdpAccordions({product}: {product: CatalogProduct}) {
  return (
    <div className="pdp-accordions">
      <details>
        <summary>Details & fit</summary>
        <p>{product.fit || "Fit grading is proposed until supplier samples are signed."}</p>
        <p>Category: {product.category === "pants" ? "Bottoms" : "T-shirts"} · Colourway: {product.palette}</p>
      </details>
      <details>
        <summary>Composition & care</summary>
        <p>
          {product.fabricTarget ??
            "Fabric composition, GSM and wash care are proposed targets only. Final specs are confirmed before any payment."}
        </p>
      </details>
      <details>
        <summary>Original words & attribution</summary>
        <p>{product.designExplanation ?? product.line}</p>
        {product.verseReference && (
          <p>
            Reference:{" "}
            {product.sourceUrl ? (
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                {product.verseReference}
              </a>
            ) : (
              product.verseReference
            )}
          </p>
        )}
      </details>
      <details>
        <summary>Preorder & delivery</summary>
        <p>
          Pieces are made after you preorder when a SKU is approved. Until then you can request interest only — no
          charge, no dispatch date promised.
        </p>
        <Link href="/how-preorder-works" className="text-link">
          How preorder works
        </Link>
      </details>
      <details>
        <summary>Returns & policies</summary>
        <p>
          Return and refund rules depend on final seller registration and garment category. See our policy pages for the
          current published terms.
        </p>
        <Link href="/policies" className="text-link">
          Read policies
        </Link>
      </details>
    </div>
  );
}