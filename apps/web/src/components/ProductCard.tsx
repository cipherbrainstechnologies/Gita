"use client";

import Link from "next/link";
import Image from "next/image";
import {useState} from "react";
import type {CatalogProduct} from "@/lib/catalog";
import {WishlistHeart} from "./WishlistHeart";

export function ProductCard({product}: {product: CatalogProduct}) {
  const front =
    product.media?.find((m) => m.view === "front") ??
    product.media?.find((m) => m.view === "on-model") ??
    product.media?.[0];
  const back = product.media?.find((m) => m.view === "back");
  const [hover, setHover] = useState(false);
  const cover = hover && back ? back : front;

  const isPants =
    product.category?.toUpperCase().includes("PANT") ||
    product.name.toUpperCase().includes("TRACK PANT");

  const chip = product.orderable
    ? "PREORDER"
    : product.displaySaleReady && cover
      ? isPants
        ? "DESIGNER TRACK"
        : "DESIGNER TEE"
      : product.status === "CONCEPT"
        ? cover
          ? "MINDSET PREVIEW"
          : "CONCEPT"
        : product.status.replace(/_/g, " ");

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="product-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div className={`product-image ${cover ? "product-image-real" : ""}`}>
        <WishlistHeart slug={product.slug} label={product.name} />
        <div className="chip">{chip}</div>
        {cover ? (
          <Image
            key={cover.src}
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 700px) 50vw, 25vw"
            className="product-photo"
            unoptimized={
              cover.src.endsWith(".svg") ||
              cover.src.includes("/api/catalog/visual/") ||
              cover.src.includes("/api/catalog/on-model/")
            }
          />
        ) : (
          <div className="photo-pending">
            <span>DESIGNER LOOK COMING</span>
            <strong>{product.line}</strong>
            <small>UNIQUE TEE / TRACK PRINT REQUIRED</small>
          </div>
        )}
        {back && cover && (
          <span className="card-view-hint" aria-hidden>
            {hover ? "BACK" : "FRONT"}
          </span>
        )}
      </div>
      <div className="product-meta">
        <div>
          <div className="eyebrow">{product.collection}</div>
          <h3>{product.name}</h3>
          <p>
            {product.fit}
            {product.line ? ` · “${product.line.slice(0, 48)}${product.line.length > 48 ? "…" : ""}”` : ""}
          </p>
          <span
            className="colour-swatch"
            title={product.palette}
            style={{background: paletteToCss(product.palette)}}
            aria-label={`Colourway ${product.palette}`}
          />
        </div>
        {product.priceInr !== null && (
          <span className="price">
            ₹{product.priceInr.toLocaleString("en-IN")}
            <small>{product.orderable ? " / preorder" : " / proposed"}</small>
          </span>
        )}
      </div>
    </Link>
  );
}

function paletteToCss(palette: string): string {
  const map: Record<string, string> = {
    charcoal: "#1a1a1a",
    sand: "#d6cbb8",
    slate: "#475569",
    olive: "#556b2f",
    clay: "#b96952",
    "muted-lilac": "#7c6bae",
    bone: "#f5f1e9",
    cobalt: "#1e3a8a",
    cherry: "#9f1239",
    sage: "#4d7c5f",
    rust: "#b45309",
    lavender: "#7c6bae",
    teal: "#0f766e",
  };
  return map[palette] ?? "#242629";
}
