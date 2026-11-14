import {createHash} from "node:crypto";
import type {Prisma} from "@prisma/client";
import {buildDesignDna, visualApiPath} from "@/lib/fashion/design-dna";
import {contentSha256FromSvg, renderFlatMockupSvg} from "@/lib/fashion/flat-mockup-svg";
import type {PrismaClient} from "@prisma/client";

type View = "front" | "back" | "detail";
const GALLERY: {view: View; mediaRole: string}[] = [
  {view: "front", mediaRole: "FRONT"},
  {view: "back", mediaRole: "BACK"},
  {view: "detail", mediaRole: "PRINT_CLOSEUP"},
];

function assetKey(slug: string, role: string, contentSha: string) {
  return createHash("sha256").update(`${slug}:${role}:${contentSha}`, "utf8").digest("hex");
}

export type SkuVisualInput = {
  id: string;
  slug: string;
  tagline: string | null;
  language: string | null;
  garmentFamily: string | null;
  category: string;
  designBriefFingerprint: string | null;
  conceptMeta: Prisma.JsonValue;
  palette: string | null;
};

export type RegisterSkuResult = {
  slug: string;
  contentHashes: string[];
  duplicateOf?: string;
};

/** Idempotent per-SKU visual registration (upsert by productId+role+assetSha256). */
export async function registerSkuVisuals(
  prisma: PrismaClient,
  p: SkuVisualInput,
  contentHashIndex: Map<string, string>,
): Promise<RegisterSkuResult | null> {
  if (!p.tagline || !p.designBriefFingerprint) return null;
  const meta = p.conceptMeta as Record<string, unknown> | null;
  const dna = buildDesignDna({
    slug: p.slug,
    designBriefFingerprint: p.designBriefFingerprint,
    quoteFingerprint:
      typeof meta?.quoteFingerprint === "string" ? meta.quoteFingerprint : p.designBriefFingerprint,
    quoteText: p.tagline,
    language: p.language,
    garmentFamily: p.garmentFamily,
    placement: typeof meta?.placement === "string" ? meta.placement : undefined,
    motif: typeof meta?.motif === "string" ? meta.motif : undefined,
    fit: typeof meta?.fit === "string" ? meta.fit : undefined,
    palette: p.palette,
  });

  const contentHashes: string[] = [];
  let duplicateOf: string | undefined;
  const imagesJson: {
    src: string;
    view: string;
    alt: string;
    origin: string;
    approved: boolean;
    role: string;
  }[] = [];

  for (const g of GALLERY) {
    const svg = renderFlatMockupSvg(dna, g.view);
    const contentSha256 = contentSha256FromSvg(svg);
    const prior = contentHashIndex.get(contentSha256);
    if (prior && prior !== p.slug) duplicateOf = prior;
    contentHashIndex.set(contentSha256, p.slug);
    contentHashes.push(contentSha256);

    const fileUrl = visualApiPath(p.slug, g.view);
    const assetSha256 = assetKey(p.slug, g.mediaRole, contentSha256);

    await prisma.productMediaV2.upsert({
      where: {productId_mediaRole_assetSha256: {productId: p.id, mediaRole: g.mediaRole, assetSha256}},
      create: {
        productId: p.id,
        mediaRole: g.mediaRole,
        fileUrl,
        origin: "TYPOGRAPHIC_PREVIEW",
        assetSha256,
        contentSha256,
        visualKind: "TYPOGRAPHIC_FLAT",
        storefrontVisible: true,
        approvedForPublication: false,
        reviewState: "PENDING",
        duplicateOfProductId: duplicateOf,
      },
      update: {
        fileUrl,
        contentSha256,
        visualKind: "TYPOGRAPHIC_FLAT",
        storefrontVisible: true,
        approvedForPublication: false,
        reviewState: "PENDING",
        duplicateOfProductId: duplicateOf ?? null,
      },
    });

    imagesJson.push({
      src: fileUrl,
      view: g.view,
      alt: `${p.slug} ${g.view} design preview — ${p.tagline.slice(0, 60)}`,
      origin: "TYPOGRAPHIC_PREVIEW",
      approved: false,
      role: g.mediaRole,
    });
  }

  const quoteFp =
    typeof meta?.quoteFingerprint === "string" ? meta.quoteFingerprint : p.designBriefFingerprint;

  await prisma.product.update({
    where: {id: p.id},
    data: {
      quoteFingerprint: quoteFp,
      conceptMeta: {
        ...(meta ?? {}),
        quoteFingerprint: quoteFp,
        designDna: dna,
        visualVersion: "typographic-flat-v1",
        salePipeline: "DISPLAY_READY",
      },
      images: imagesJson,
      displaySaleReady: true,
      disclosure:
        "This SKU has a unique design preview and size variants on file. Checkout and payment stay disabled until legal, supplier and readiness gates pass.",
    },
  });

  return {slug: p.slug, contentHashes, duplicateOf};
}