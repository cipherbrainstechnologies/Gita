import {NextResponse} from "next/server";
import {buildDesignDna} from "@/lib/fashion/design-dna";
import {contentSha256FromSvg, renderFlatMockupSvg} from "@/lib/fashion/flat-mockup-svg";
import {prisma} from "@/lib/db";

const VIEWS = new Set(["front", "back", "detail"]);
const ROLE: Record<string, string> = {front: "FRONT", back: "BACK", detail: "PRINT_CLOSEUP"};

export async function GET(_req: Request, ctx: {params: Promise<{slug: string; view: string}>}) {
  const {slug, view: rawView} = await ctx.params;
  const view = rawView.toLowerCase();
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

  const svg = renderFlatMockupSvg(dna, view as "front" | "back" | "detail");
  const etag = `"${contentSha256FromSvg(svg)}"`;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
      ETag: etag,
      "X-Gita-Visual-Kind": "TYPOGRAPHIC_FLAT",
      "X-Gita-Media-Role": ROLE[view] ?? "FRONT",
    },
  });
}