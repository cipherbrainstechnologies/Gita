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
    .update(JSON.stringify({dna, v: opts?.rendererVersion ?? "on-model-raster-v1"}), "utf8")
    .digest("hex");
  const visualKind = "ON_MODEL_CPU_COMPOSITE";
  const origin = "CPU_COMPOSITE_PREVIEW";

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
      alt: `${p.slug} on-model ${g.view} — ${dna.modelIdentityId}`,
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
      visualKind: "TYPOGRAPHIC_FLAT",
      storefrontVisible: true,
    },
    data: {storefrontVisible: false, reviewState: "SUPERSEDED_BY_ON_MODEL"},
  });

  await prisma.product.update({
    where: {id: p.id},
    data: {
      conceptMeta: {
        ...(meta ?? {}),
        designDna: dna,
        onModelGeneration: {
          rendererVersion: opts?.rendererVersion ?? "on-model-raster-v1",
          generationSource: opts?.generationSource ?? "CPU_COMPOSITE",
          fingerprint,
          modelIdentityId: dna.modelIdentityId,
        },
        visualVersion: opts?.rendererVersion ?? "on-model-raster-v1",
      },
      images: imagesJson,
      displaySaleReady: true,
      disclosure: QA_DISCLOSURE,
    },
  });

  return {slug: p.slug, views: VIEWS.length, fingerprint};
}