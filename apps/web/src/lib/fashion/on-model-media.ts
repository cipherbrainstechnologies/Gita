import {createHash} from "node:crypto";
import type {PrismaClient} from "@prisma/client";
import {buildDesignDna} from "./design-dna";
import {QA_DISCLOSURE} from "./visual-quality-gate";
import {onModelApiPath, type OnModelView} from "./render-on-model-raster";
import type {SkuVisualInput} from "./register-sku-visual";

const VIEWS: {view: OnModelView; mediaRole: string}[] = [
  {view: "front", mediaRole: "FRONT"},
  {view: "back", mediaRole: "BACK"},
  {view: "detail", mediaRole: "PRINT_CLOSEUP"},
  {view: "lifestyle", mediaRole: "LIFESTYLE"},
];

function assetKey(slug: string, role: string, contentSha: string) {
  return createHash("sha256").update(`${slug}:${role}:${contentSha}:on-model-v1`, "utf8").digest("hex");
}

export type RegisterOnModelResult = {
  slug: string;
  views: number;
  fingerprint: string;
};

/** Registers persistent on-model raster URLs (rendered by API or pre-stored assets). */
export async function registerOnModelMedia(
  prisma: PrismaClient,
  p: SkuVisualInput,
  contentShaByView: Partial<Record<OnModelView, string>>,
  opts?: {
    rendererVersion?: string;
    generationSource?: string;
    fileUrlOverrides?: Partial<Record<OnModelView, string>>;
    visualKind?: string;
    presentation?: "ON_MODEL" | "FLATLAY";
  },
): Promise<RegisterOnModelResult | null> {
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

  const fingerprint = createHash("sha256")
    .update(JSON.stringify({dna, v: opts?.rendererVersion ?? "cpu-designer-flatlay-v5"}), "utf8")
    .digest("hex");
  const isPants = dna.garmentFamily === "PANTS";
  // USP: both tees and track pants use unique designer flat-lays (never shared model plates).
  const presentation = opts?.presentation ?? "FLATLAY";
  const visualKind =
    opts?.visualKind ?? (isPants ? "PANTS_FLATLAY_PREVIEW" : "TEE_FLATLAY_PREVIEW");
  const origin =
    visualKind === "PANTS_FLATLAY_PREVIEW" ? "PANTS_FLATLAY_PREVIEW" : "TEE_FLATLAY_PREVIEW";

  const imagesJson: {
    src: string;
    view: string;
    alt: string;
    origin: string;
    approved: boolean;
    role: string;
    visualKind: string;
    modelIdentityId: string;
  }[] = [];

  for (const g of VIEWS) {
    const contentSha256 =
      contentShaByView[g.view] ??
      createHash("sha256").update(`${p.slug}:${g.view}:${fingerprint}`, "utf8").digest("hex");
    const fileUrl = opts?.fileUrlOverrides?.[g.view] ?? onModelApiPath(p.slug, g.view);
    const assetSha256 = assetKey(p.slug, g.mediaRole, contentSha256);

    await prisma.productMediaV2.upsert({
      where: {productId_mediaRole_assetSha256: {productId: p.id, mediaRole: g.mediaRole, assetSha256}},
      create: {
        productId: p.id,
        mediaRole: g.mediaRole,
        fileUrl,
        origin,
        assetSha256,
        contentSha256,
        visualKind,
        storefrontVisible: true,
        approvedForPublication: false,
        reviewState: "PENDING",
      },
      update: {
        fileUrl,
        contentSha256,
        origin,
        visualKind,
        storefrontVisible: true,
        approvedForPublication: false,
      },
    });

    imagesJson.push({
      src: fileUrl,
      view: g.view === "lifestyle" ? "lifestyle" : g.view === "detail" ? "detail" : g.view,
      alt:
        visualKind === "PANTS_FLATLAY_PREVIEW"
          ? `${p.slug} track pant flat-lay ${g.view}`
          : visualKind === "TEE_FLATLAY_PREVIEW"
            ? `${p.slug} tee flat-lay ${g.view}`
            : `${p.slug} on-model ${g.view} — ${dna.modelIdentityId}`,
      origin,
      approved: false,
      role: g.mediaRole,
      visualKind,
      modelIdentityId: dna.modelIdentityId,
    });
  }

  await prisma.productMediaV2.updateMany({
    where: {
      productId: p.id,
      visualKind: {in: ["TYPOGRAPHIC_FLAT", "ON_MODEL_CPU_COMPOSITE", "ON_MODEL_RASTER"]},
      storefrontVisible: true,
    },
    data: {storefrontVisible: false, reviewState: "SUPERSEDED_BY_DESIGNER_FLATLAY"},
  });

  await prisma.product.update({
    where: {id: p.id},
    data: {
      conceptMeta: {
        ...(meta ?? {}),
        designDna: dna,
        onModelGeneration: {
          rendererVersion: opts?.rendererVersion ?? "cpu-designer-flatlay-v5",
          generationSource:
            opts?.generationSource ?? (isPants ? "PANTS_FLATLAY" : "TEE_FLATLAY"),
          fingerprint,
          modelIdentityId: dna.modelIdentityId,
          presentation,
          visualKind,
          garmentFamily: dna.garmentFamily,
          colourwayId: dna.colourwayId,
          colourHex: dna.colourHex,
          usp: "DESIGNER_GARMENT_WITH_MINDSET_PRINT",
        },
        visualVersion: opts?.rendererVersion ?? "cpu-designer-flatlay-v5",
      },
      images: imagesJson,
      displaySaleReady: true,
      disclosure: QA_DISCLOSURE,
    },
  });

  return {slug: p.slug, views: VIEWS.length, fingerprint};
}