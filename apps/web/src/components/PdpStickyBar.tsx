"use client";

import Link from "next/link";

type Props = {
  buy: boolean;
  priceInr: number | null;
  slug: string;
  defaultSize: string;
  label: string;
};

export function PdpStickyBar({buy, priceInr, slug, defaultSize, label}: Props) {
  const checkout = `/checkout?product=${encodeURIComponent(slug)}&size=${encodeURIComponent(defaultSize)}`;

  return (
    <div className="pdp-sticky-bar" role="region" aria-label="Purchase actions">
      <div className="pdp-sticky-price">
        {priceInr !== null ? (
          <>
            <strong>₹{priceInr.toLocaleString("en-IN")}</strong>
            <span>{buy ? "Preorder price" : "Proposed"}</span>
          </>
        ) : (
          <span>Price pending</span>
        )}
      </div>
      {buy ? (
        <Link className="primary-cta pdp-sticky-cta" href={checkout}>
          Preorder
        </Link>
      ) : (
        <a className="primary-cta pdp-sticky-cta" href="#request-design">
          Request design
        </a>
      )}
      <span className="pdp-sticky-note sr-only">{label}</span>
    </div>
  );
}