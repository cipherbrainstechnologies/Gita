import type {Prisma} from "@prisma/client";
import {withTimeout} from "./config";

export type DemoProduct = {
  slug: string; name: string; collection: string; category: "tees" | "pants"; line: string;
  palette: string; priceInr: number; fit: string; sizes: string[]; approved: false;
};
/** Editorial previews only. No garment physically exists and there is NO checkout for these examples. */
export const sampleConcepts: DemoProduct[] = [
  { slug: "quiet-is-a-power-move", name: "Quiet Power Oversized Tee", collection: "STATIC / NOISE", category: "tees", line: "QUIET IS A POWER MOVE.", palette: "charcoal", priceInr: 999, fit: "Oversized concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "less-proving", name: "Less Proving Relaxed Tee", collection: "UNFINISHED", category: "tees", line: "LESS PROVING. MORE BECOMING.", palette: "sand", priceInr: 1099, fit: "Relaxed concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "train-the-habit", name: "Train The Habit Track Pant", collection: "MOTION > MOTIVATION", category: "pants", line: "TRAIN THE HABIT / NOT THE HIGHLIGHT", palette: "slate", priceInr: 1499, fit: "Straight concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "real-friends-question", name: "Honest Friend Tee", collection: "FRENEMY?", category: "tees", line: "REAL FRIENDS QUESTION THE SCRIPT.", palette: "muted-lilac", priceInr: 999, fit: "Boxy concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "progress-is-personal", name: "Progress Is Personal Track Pant", collection: "RESET", category: "pants", line: "PROGRESS IS PERSONAL.", palette: "olive", priceInr: 1399, fit: "Tapered concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "offline-not-absent", name: "Offline Not Absent Tee", collection: "AFTER CLASS", category: "tees", line: "OFFLINE ≠ ABSENT.", palette: "clay", priceInr: 899, fit: "Standard concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false }
];

export type CatalogStatus = "CONCEPT" | "SAMPLE_PENDING" | "SAMPLE_APPROVED" | "PREORDER" | "CLOSED" | "ARCHIVED";
export type CatalogVariant = {sku: string; size: string; pricePaise: string; enabled: boolean};
export type CatalogProduct = {
  slug: string; name: string; collection: string; category: string; line: string; palette: string; fit: string;
  sizes: string[]; priceInr: number | null; status: CatalogStatus;
  /** True ONLY when status === PREORDER and at least one variant is enabled. */
  orderable: boolean; source: "db" | "sample"; variants: CatalogVariant[];
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const bySize = (a: string, b: string) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b);

export function fromSample(d: DemoProduct): CatalogProduct {
  return {slug: d.slug, name: d.name, collection: d.collection, category: d.category, line: d.line, palette: d.palette, fit: d.fit,
    sizes: d.sizes, priceInr: d.priceInr, status: "CONCEPT", orderable: false, source: "sample", variants: []};
}

type DbRow = Prisma.ProductGetPayload<{include: {variants: true}}>;
export function fromDb(r: DbRow): CatalogProduct {
  const orderable = r.status === "PREORDER" && r.variants.some(v => v.enabled);
  // Only enabled variants are purchasable; otherwise list proposed sizes for information.
  const shown = orderable ? r.variants.filter(v => v.enabled) : r.variants;
  const paise = shown.map(v => v.pricePaise).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return {
    slug: r.slug, name: r.title, collection: r.collection ?? "", category: r.category, line: r.tagline ?? r.title,
    palette: r.palette ?? "charcoal", fit: r.variants[0]?.fit ?? "", status: r.status, orderable, source: "db",
    sizes: [...new Set(shown.map(v => v.size))].sort(bySize),
    priceInr: paise.length ? Number(paise[0]) / 100 : null,
    variants: r.variants.map(v => ({sku: v.sku, size: v.size, pricePaise: v.pricePaise.toString(), enabled: v.enabled}))
  };
}

/** null = database unavailable. [] = reachable but empty. */
async function loadDb(): Promise<CatalogProduct[] | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const {prisma} = await import("./db");
    const rows = await withTimeout(prisma.product.findMany({where: {status: {not: "ARCHIVED"}}, include: {variants: {orderBy: {sku: "asc"}}}, orderBy: [{createdAt: "asc"}, {slug: "asc"}]}), 3000);
    return rows.map(fromDb);
  } catch { return null; }
}

/** Prisma first; sample concepts (never orderable) only when the DB is unreachable or has no products. */
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const db = await loadDb();
  return db && db.length ? db : sampleConcepts.map(fromSample);
}
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  return (await getCatalogProducts()).find(p => p.slug === slug) ?? null;
}
