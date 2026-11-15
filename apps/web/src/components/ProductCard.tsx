import Link from "next/link";
import Image from "next/image";
import type {CatalogProduct} from "@/lib/catalog";

export function ProductCard({product}: {product: CatalogProduct}) {
  const cover = product.media?.find((m) => m.view === "front") ?? product.media?.[0];
  const isOnModelRaster =
    cover?.src.includes("/api/catalog/on-model/") ||
    cover?.src.includes("/api/assets/generated/") ||
    (cover as {origin?: string} | undefined)?.origin === "CPU_COMPOSITE_PREVIEW" ||
    (cover as {origin?: string} | undefined)?.origin === "PANTS_FLATLAY_PREVIEW";
  const isPants =
    product.category?.toUpperCase().includes("PANT") ||
    product.name.toUpperCase().includes("TRACK PANT") ||
    product.fit?.toUpperCase().includes("TRACK");
  const chip = product.orderable
    ? "PREORDER"
    : product.displaySaleReady && cover
      ? "RESERVE INTEREST"
      : product.status === "CONCEPT"
        ? cover
          ? isOnModelRaster
            ? isPants
              ? "FLAT-LAY PREVIEW"
              : "DIGITAL PREVIEW"
            : "MODEL PREVIEW"
          : "CONCEPT"
        : product.status.replace(/_/g, " ");

  return (
    <Link href={`/shop/${product.slug}`} className="product-card">
      <div className={`product-image ${cover ? "product-image-real" : ""}`}>
        <div className="chip">{chip}</div>
        {cover ? (
          <Image
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
            <span>NEW PHOTOS COMING</span>
            <strong>{product.line}</strong>
            <small>CORRECT GARMENT PHOTOGRAPHY REQUIRED</small>
          </div>
        )}
      </div>
      <div className="product-meta">
        <div>
          <div className="eyebrow">{product.collection}</div>
          <h3>{product.name}</h3>
          <p>{product.fit}</p>
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
    bone: "#f5f1e9",
    cobalt: "#1e3a8a",
    cherry: "#9f1239",
    sage: "#4d7c5f",
    rust: "#b45309",
    lavender: "#7c6bae",
    sand: "#d6cbb8",
    teal: "#0f766e",
    slate: "#475569",
    olive: "#556b2f",
    cream: "#fffefa",
    denim: "#3d5a80",
    plum: "#5b2c6f",
    mustard: "#ca8a04",
    forest: "#14532d",
    "muted-lilac": "#a78bfa",
    clay: "#c2410c",
  };
  return map[palette.toLowerCase()] ?? "#60635d";
}
