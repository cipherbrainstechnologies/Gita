import type {CatalogProduct, CatalogStatus} from "../catalog";
import {
  fetchMedusaProductByHandle,
  fetchMedusaProducts,
  type MedusaStoreProduct,
} from "./medusa-client";

const GITA_META = {
  category: "gita_category",
  palette: "gita_palette",
  collection: "gita_collection",
  status: "gita_status",
  line: "gita_line",
  fit: "gita_fit",
  theme: "gita_theme",
  audienceFit: "gita_audience_fit",
  orderable: "gita_orderable",
  displaySaleReady: "gita_display_sale_ready",
  fabric: "gita_fabric",
  verseRef: "gita_verse_reference",
} as const;

function metaString(md: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = md?.[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function metaBool(md: Record<string, unknown> | undefined, key: string): boolean | undefined {
  const v = md?.[key];
  if (v === true || v === "true" || v === "1") return true;
  if (v === false || v === "false" || v === "0") return false;
  return undefined;
}

function normalizeStatus(raw: string | undefined): CatalogStatus {
  const up = (raw ?? "CONCEPT").toUpperCase();
  const allowed: CatalogStatus[] = [
    "CONCEPT",
    "SAMPLE_PENDING",
    "SAMPLE_APPROVED",
    "PREORDER",
    "CLOSED",
    "ARCHIVED",
  ];
  return allowed.includes(up as CatalogStatus) ? (up as CatalogStatus) : "CONCEPT";
}

function normalizeCategory(raw: string | undefined, title?: string): string {
  const c = (raw ?? "").toLowerCase();
  if (c === "pants" || c === "tees") return c;
  if (c.includes("pant") || c.includes("bottom") || c.includes("jogger") || c.includes("track")) return "pants";
  if (c.includes("tee") || c.includes("shirt") || c.includes("top")) return "tees";
  const t = (title ?? "").toLowerCase();
  if (t.includes("track pant") || t.includes("jogger") || t.includes("trouser")) return "pants";
  return "tees";
}

function paiseFromVariant(v: NonNullable<MedusaStoreProduct["variants"]>[number]): bigint | null {
  const amt = v.calculated_price?.calculated_amount;
  if (amt == null || !Number.isFinite(amt)) return null;
  return BigInt(Math.round(amt));
}

function paletteFromVariantOptions(v: NonNullable<MedusaStoreProduct["variants"]>[number]): string | undefined {
  const opts = v.options ?? [];
  for (const o of opts) {
    const key = (o.option?.title ?? o.option_id ?? "").toLowerCase();
    if (key.includes("color") || key.includes("colour")) {
      const val = o.value?.toLowerCase().trim();
      if (val) return val.replace(/\s+/g, "-");
    }
  }
  return undefined;
}

async function enrichFromPrisma(slug: string): Promise<Partial<CatalogProduct> | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const {getProductBySlugFromPrisma} = await import("../catalog");
    const row = await getProductBySlugFromPrisma(slug);
    if (!row) return null;
    return {
      collection: row.collection,
      category: row.category,
      line: row.line,
      palette: row.palette,
      fit: row.fit,
      status: row.status,
      orderable: row.orderable,
      displaySaleReady: row.displaySaleReady,
      theme: row.theme,
      audienceFit: row.audienceFit,
      fabricTarget: row.fabricTarget,
      media: row.media,
      designExplanation: row.designExplanation,
      verseReference: row.verseReference,
      sourceUrl: row.sourceUrl,
      disclosure: row.disclosure,
    };
  } catch {
    return null;
  }
}

export function mapMedusaProduct(p: MedusaStoreProduct, enrich?: Partial<CatalogProduct> | null): CatalogProduct {
  const handle = p.handle ?? p.id;
  const md = p.metadata ?? {};
  const variants = (p.variants ?? []).map((v) => {
    const pricePaise = paiseFromVariant(v);
    const size =
      v.options?.find((o) => (o.option?.title ?? "").toLowerCase().includes("size"))?.value ??
      v.title?.split(" / ").pop() ??
      v.title ??
      "M";
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

  const status = normalizeStatus(metaString(md, GITA_META.status) ?? enrich?.status);
  const metaOrderable = metaBool(md, GITA_META.orderable);
  const orderable =
    metaOrderable ?? (enrich?.orderable ?? (status === "PREORDER" && variants.some((v) => v.enabled)));

  const firstVariant = p.variants?.[0];
  const palette =
    metaString(md, GITA_META.palette) ??
    (firstVariant ? paletteFromVariantOptions(firstVariant) : undefined) ??
    enrich?.palette ??
    "charcoal";

  const category = normalizeCategory(metaString(md, GITA_META.category) ?? enrich?.category, p.title);

  const displaySaleReady =
    metaBool(md, GITA_META.displaySaleReady) ?? enrich?.displaySaleReady ?? Boolean(enrich?.media?.length);

  const medusaMedia = p.thumbnail
    ? [{src: p.thumbnail, view: "front" as const, alt: p.title ?? handle, simulated: true as const}]
    : undefined;

  return {
    slug: handle,
    name: p.title ?? handle,
    collection: metaString(md, GITA_META.collection) ?? enrich?.collection ?? "",
    category,
    line: metaString(md, GITA_META.line) ?? enrich?.line ?? p.title ?? handle,
    palette,
    fit: metaString(md, GITA_META.fit) ?? enrich?.fit ?? "",
    status,
    orderable: Boolean(orderable),
    displaySaleReady,
    source: "medusa",
    audienceFit: metaString(md, GITA_META.audienceFit) ?? enrich?.audienceFit ?? "unisex",
    theme: metaString(md, GITA_META.theme) ?? enrich?.theme,
    sizes: sizes.length ? sizes : (enrich?.sizes ?? []),
    priceInr: minPaise ? Number(minPaise) / 100 : enrich?.priceInr ?? null,
    variants: variants.length ? variants : (enrich?.variants ?? []),
    media: enrich?.media?.length ? enrich.media : medusaMedia,
    fabricTarget: metaString(md, GITA_META.fabric) ?? enrich?.fabricTarget,
    verseReference: metaString(md, GITA_META.verseRef) ?? enrich?.verseReference,
    designExplanation: enrich?.designExplanation,
    disclosure: enrich?.disclosure,
  };
}

export async function listCatalogFromMedusa(): Promise<CatalogProduct[]> {
  const products = await fetchMedusaProducts(48);
  const out: CatalogProduct[] = [];
  for (const p of products) {
    const handle = p.handle ?? p.id;
    const enrich = await enrichFromPrisma(handle);
    out.push(mapMedusaProduct(p, enrich));
  }
  return out;
}

export async function getProductFromMedusa(slug: string): Promise<CatalogProduct | null> {
  const p = await fetchMedusaProductByHandle(slug);
  if (!p) return null;
  const enrich = await enrichFromPrisma(slug);
  return mapMedusaProduct(p, enrich);
}