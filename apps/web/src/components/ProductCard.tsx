import Link from "next/link";
import Image from "next/image";
import type {CatalogProduct} from "@/lib/catalog";

export function ProductCard({product}: {product: CatalogProduct}) {
  const cover = product.media?.find((m) => m.view === "front") ?? product.media?.[0];
  const isOnModelRaster =
    cover?.src.includes("/api/catalog/on-model/") ||
    cover?.src.includes("/api/assets/generated/") ||
    (cover as {origin?: string} | undefined)?.origin === "CPU_COMPOSITE_PREVIEW";
  const chip = product.orderable
    ? "PREORDER"
    : product.displaySaleReady && cover
      ? "RESERVE INTEREST"
      : product.status === "CONCEPT"
        ? cover
        ? isOnModelRaster
          ? "ON-MODEL"
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
            <span>MEDIA PENDING</span>
            <strong>{product.line}</strong>
            <small>NOT A PHYSICAL SAMPLE · PHOTO REQUIRED</small>
          </div>
        )}
      </div>
      <div className="product-meta">
        <div>
          <div className="eyebrow">{product.collection}</div>
          <h3>{product.name}</h3>
          <p>{product.fit}</p>
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
