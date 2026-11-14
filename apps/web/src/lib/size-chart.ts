import {withTimeout} from "./config";

export type SizeChartTable = {product: string; slug: string; columns: string[]; rows: {size: string; values: Record<string, string>}[]};
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const bySize = (a: string, b: string) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b);

/** Flat {key: string|number} objects only; anything else is ignored rather than guessed at. */
export function flattenMeasurements(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (typeof x === "string" || typeof x === "number") out[k] = String(x);
  return out;
}

export const prettyKey = (k: string) => k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\bcm\b/i, "(cm)").replace(/\b\w/g, c => c.toUpperCase());

/** Measured garment tables from the DB (ProductVariant.garmentMeasurements). Empty when none recorded or DB unavailable. */
export async function loadSizeCharts(): Promise<SizeChartTable[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const {prisma} = await import("./db");
    const products = await withTimeout(prisma.product.findMany({
      where: {status: {notIn: ["ARCHIVED"]}}, orderBy: {createdAt: "asc"},
      select: {slug: true, title: true, variants: {select: {size: true, garmentMeasurements: true}}}
    }), 3000);
    return products.flatMap((p): SizeChartTable[] => {
      const rows = p.variants.map(v => ({size: v.size, values: flattenMeasurements(v.garmentMeasurements)})).filter(r => Object.keys(r.values).length > 0).sort((a, b) => bySize(a.size, b.size));
      const columns = [...new Set(rows.flatMap(r => Object.keys(r.values)))];
      return rows.length ? [{product: p.title, slug: p.slug, columns, rows}] : [];
    });
  } catch { return []; }
}
