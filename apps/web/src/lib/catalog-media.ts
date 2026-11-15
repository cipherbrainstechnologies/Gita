import type {ConceptMedia} from "./catalog";
import {prisma} from "./db";
import {isSharedTemplateUrl} from "./fashion/template-urls";

export type ResolvedMedia = ConceptMedia & {
  origin?: string;
  approved?: boolean;
  role?: string;
};

const roleToView: Record<string, ConceptMedia["view"]> = {
  FRONT: "front",
  BACK: "back",
  SIDE: "side",
  PRINT_CLOSEUP: "detail",
  FABRIC: "detail",
  ON_MODEL: "on-model",
  LIFESTYLE: "lifestyle",
};

function normalizeImagesJson(images: unknown): ResolvedMedia[] {
  if (!Array.isArray(images)) return [];
  const out: ResolvedMedia[] = [];
  for (const x of images) {
    if (!x || typeof x !== "object") continue;
    const row = x as Record<string, unknown>;
    const view = (typeof row.view === "string" ? row.view : "on-model") as ConceptMedia["view"];
    const src = typeof row.src === "string" ? row.src : "";
    if (!src) continue;
    out.push({
      src,
      view,
      alt: typeof row.alt === "string" ? row.alt : "Product media",
      simulated: true,
      origin: typeof row.origin === "string" ? row.origin : undefined,
      approved: row.approved === true,
      role: typeof row.role === "string" ? row.role : undefined,
    });
  }
  return out;
}

/** Loads DB-backed media for a product; editorial sample slugs without rows return []. */
export async function loadProductMedia(productId: string, slug: string): Promise<ResolvedMedia[]> {
  try {
    const [rows, product] = await Promise.all([
      prisma.productMediaV2.findMany({
        where: {
          productId,
          OR: [{approvedForPublication: true}, {storefrontVisible: true}],
        },
        orderBy: [{mediaRole: "asc"}, {createdAt: "asc"}],
      }),
      prisma.product.findUnique({where: {id: productId}, select: {images: true}}),
    ]);
    const fromTable: ResolvedMedia[] = rows
      .filter((m) => {
        if (isSharedTemplateUrl(m.fileUrl)) return false;
        if (m.visualKind === "TYPOGRAPHIC_FLAT" || m.origin === "TYPOGRAPHIC_PREVIEW") return false;
        if (m.visualKind === "ON_MODEL_RASTER" || m.visualKind === "ON_MODEL_CPU_COMPOSITE") return false;
        if (m.origin === "CPU_COMPOSITE_PREVIEW") return false;
        if (m.fileUrl.includes("/api/catalog/visual/")) return false;
        return true;
      })
      .map((m) => ({
        src: m.fileUrl,
        view: roleToView[m.mediaRole] ?? "on-model",
        alt: `${slug} ${m.mediaRole.toLowerCase().replace("_", " ")} view`,
        simulated: (m.origin !== "PHOTOGRAPHED_SAMPLE") as true,
        origin: m.origin,
        approved: m.approvedForPublication,
        role: m.mediaRole,
      }));
    const fromJson = normalizeImagesJson(product?.images);
    const seen = new Set<string>();
    return [...fromTable, ...fromJson].filter((m) => {
      const k = `${m.view}:${m.src}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  } catch {
    return [];
  }
}

export function hasApprovedPair(media: ResolvedMedia[]): {front: boolean; back: boolean} {
  return {
    front: media.some((m) => m.view === "front" && m.approved === true),
    back: media.some((m) => m.view === "back" && m.approved === true),
  };
}

/** Batch-load storefront-visible media for catalog pages (avoids N+1). */
export async function loadStorefrontMediaForProducts(
  productIds: string[],
): Promise<Map<string, ConceptMedia[]>> {
  if (!productIds.length) return new Map();
  const rows = await prisma.productMediaV2.findMany({
    where: {
      productId: {in: productIds},
      OR: [{storefrontVisible: true}, {approvedForPublication: true}],
    },
    orderBy: [{productId: "asc"}, {mediaRole: "asc"}],
  });
  const out = new Map<string, ConceptMedia[]>();
  for (const m of rows) {
    if (isSharedTemplateUrl(m.fileUrl)) continue;
    if (m.visualKind === "TYPOGRAPHIC_FLAT" || m.fileUrl.includes("/api/catalog/visual/")) continue;
    if (m.visualKind === "ON_MODEL_RASTER" || m.visualKind === "ON_MODEL_CPU_COMPOSITE") continue;
    if (m.origin === "CPU_COMPOSITE_PREVIEW") continue;
    const list = out.get(m.productId) ?? [];
    list.push({
      src: m.fileUrl,
      view: roleToView[m.mediaRole] ?? "on-model",
      alt: `${m.mediaRole} preview`,
      simulated: true,
    });
    out.set(m.productId, list);
  }
  return out;
}