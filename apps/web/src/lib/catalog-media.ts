import type {ConceptMedia} from "./catalog";
import {prisma} from "./db";

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
        where: {productId, approvedForPublication: true},
        orderBy: [{mediaRole: "asc"}, {createdAt: "asc"}],
      }),
      prisma.product.findUnique({where: {id: productId}, select: {images: true}}),
    ]);
    const fromTable: ResolvedMedia[] = rows.map((m) => ({
      src: m.fileUrl,
      view: roleToView[m.mediaRole] ?? "on-model",
      alt: `${slug} ${m.mediaRole.toLowerCase().replace("_", " ")} view`,
      simulated: m.origin === "AI_SIMULATION" ? true : true,
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
    front: media.some((m) => m.view === "front" && m.approved !== false),
    back: media.some((m) => m.view === "back" && m.approved !== false),
  };
}