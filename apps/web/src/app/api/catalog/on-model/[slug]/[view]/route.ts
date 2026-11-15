import {NextResponse} from "next/server";
import {buildDesignDna} from "@/lib/fashion/design-dna";
import {renderOnModelRaster, type OnModelView} from "@/lib/fashion/render-on-model-raster";
import {prisma} from "@/lib/db";

const VIEWS = new Set<OnModelView>(["front", "back", "detail", "lifestyle"]);

export async function GET(_req: Request, ctx: {params: Promise<{slug: string; view: string}>}) {
  const {slug, view: raw} = await ctx.params;
  const view = raw.toLowerCase() as OnModelView;
  if (!VIEWS.has(view)) return NextResponse.json({error: "INVALID_VIEW"}, {status: 400});

  const product = await prisma.product.findUnique({
    where: {slug},
    select: {
      slug: true,
      tagline: true,
      language: true,
      garmentFamily: true,
      designBriefFingerprint: true,
      conceptMeta: true,
      palette: true,
    },
  });
  if (!product?.designBriefFingerprint || !product.tagline) {
    return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
  }

  const meta = product.conceptMeta as Record<string, unknown> | null;
  const dna = buildDesignDna({
    slug: product.slug,
    designBriefFingerprint: product.designBriefFingerprint,
    quoteFingerprint:
      typeof meta?.quoteFingerprint === "string"
        ? meta.quoteFingerprint
        : product.designBriefFingerprint,
    quoteText: product.tagline,
    language: product.language,
    garmentFamily: product.garmentFamily,
    placement: typeof meta?.placement === "string" ? meta.placement : undefined,
    motif: typeof meta?.motif === "string" ? meta.motif : undefined,
    fit: typeof meta?.fit === "string" ? meta.fit : undefined,
    palette: product.palette,
  });

  const rendered = await renderOnModelRaster(dna, view);
  return new NextResponse(new Uint8Array(rendered.bytes), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      ETag: `"${rendered.sha256}"`,
      "X-Gita-Visual-Kind": rendered.visualKind,
      "X-Gita-Presentation": rendered.presentation,
      "X-Gita-Garment-Family": dna.garmentFamily,
      "X-Gita-Model-Identity": rendered.modelIdentityId,
      "X-Gita-Renderer": rendered.rendererVersion,
      "X-Gita-Colourway": dna.colourwayId,
    },
  });
}
