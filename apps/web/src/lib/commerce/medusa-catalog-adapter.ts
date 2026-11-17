import type {CatalogProduct} from "../catalog";
import {
  fetchMedusaProductByHandle,
  fetchMedusaProducts,
  type MedusaStoreProduct,
} from "./medusa-client";

function paiseFromVariant(v: NonNullable<MedusaStoreProduct["variants"]>[number]): bigint | null {
  const amt = v.calculated_price?.calculated_amount;
  if (amt == null || !Number.isFinite(amt)) return null;
  return BigInt(Math.round(amt));
}

function mapProduct(p: MedusaStoreProduct): CatalogProduct {
  const handle = p.handle ?? p.id;
  const variants = (p.variants ?? []).map((v) => {
    const pricePaise = paiseFromVariant(v);
    const size = v.title?.split(" / ").pop() ?? v.title ?? "M";
    return {
      sku: v.sku ?? v.id,
      size,
      pricePaise: pricePaise?.toString() ?? "0",
      enabled: pricePaise != null && pricePaise > 0n,
    };
  });
  const sizes = [...new Set(variants.map((v) => v.size))];
  const minPaise = variants
    .map((v) => BigInt(v.pricePaise))
    .filter((n) => n > 0n)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[0];

  return {
    slug: handle,
    name: p.title ?? handle,
    collection: "",
    category: "tees",
    line: p.title ?? handle,
    palette: "charcoal",
    fit: "",
    status: "CONCEPT",
    orderable: false,
    displaySaleReady: false,
    source: "medusa",
    audienceFit: "unisex",
    sizes,
    priceInr: minPaise ? Number(minPaise) / 100 : null,
    variants,
    media: p.thumbnail
      ? [{src: p.thumbnail, view: "front" as const, alt: p.title ?? handle, simulated: true}]
      : undefined,
  };
}

export async function listCatalogFromMedusa(): Promise<CatalogProduct[]> {
  const products = await fetchMedusaProducts(48);
  return products.map(mapProduct);
}

export async function getProductFromMedusa(slug: string): Promise<CatalogProduct | null> {
  const p = await fetchMedusaProductByHandle(slug);
  return p ? mapProduct(p) : null;
}