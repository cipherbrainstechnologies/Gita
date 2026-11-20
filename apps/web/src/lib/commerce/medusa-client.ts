import {medusaBackendUrl, medusaPublishableKey} from "./flags";

export type MedusaStoreProduct = {
  id: string;
  handle?: string;
  title?: string;
  thumbnail?: string | null;
  metadata?: Record<string, unknown>;
  variants?: Array<{
    id: string;
    sku?: string | null;
    title?: string;
    calculated_price?: {calculated_amount?: number; currency_code?: string} | null;
    options?: Array<{option?: {title?: string}; option_id?: string; value?: string}>;
  }>;
};

type ProductListResponse = {products: MedusaStoreProduct[]; count?: number};

export async function fetchMedusaProducts(limit = 50): Promise<MedusaStoreProduct[]> {
  const base = medusaBackendUrl();
  const key = medusaPublishableKey();
  if (!base || !key) return [];

  const url = new URL(`${base}/store/products`);
  url.searchParams.set("limit", String(Math.min(limit, 100)));
  url.searchParams.set("fields", "id,handle,title,thumbnail,metadata,*variants,+variants.options,*variants.calculated_price");

  const res = await fetch(url, {
    headers: {"x-publishable-api-key": key, accept: "application/json"},
    next: {revalidate: 60},
  });
  if (!res.ok) return [];
  const body = (await res.json()) as ProductListResponse;
  return body.products ?? [];
}

export async function fetchMedusaProductByHandle(handle: string): Promise<MedusaStoreProduct | null> {
  const base = medusaBackendUrl();
  const key = medusaPublishableKey();
  if (!base || !key) return null;

  const url = new URL(`${base}/store/products`);
  url.searchParams.set("handle", handle);
  url.searchParams.set("limit", "1");
  url.searchParams.set("fields", "id,handle,title,thumbnail,metadata,*variants,+variants.options,*variants.calculated_price");

  const res = await fetch(url, {
    headers: {"x-publishable-api-key": key, accept: "application/json"},
    next: {revalidate: 30},
  });
  if (!res.ok) return null;
  const body = (await res.json()) as ProductListResponse;
  return body.products?.[0] ?? null;
}