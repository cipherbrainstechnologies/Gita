import {NextRequest, NextResponse} from "next/server";
import {getCatalogProducts, queryCatalogPage} from "@/lib/catalog";
import {stage} from "@/lib/config";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Number.parseInt(sp.get("page") ?? "1", 10) || 1;
  const pageSize = Math.min(36, Number.parseInt(sp.get("limit") ?? "30", 10) || 30);
  const catalogPage = await queryCatalogPage({
    category: sp.get("category") ?? undefined,
    theme: sp.get("theme") ?? undefined,
    fit: sp.get("fit") ?? undefined,
    audienceFit: sp.get("audienceFit") ?? undefined,
    q: sp.get("q") ?? undefined,
    page,
    pageSize,
  });
  const fallback = catalogPage ?? {
    items: await getCatalogProducts(),
    total: 0,
    page: 1,
    pageSize,
    orderableOnPage: 0,
  };
  const c = sp.get("category");
  const products = fallback.items.filter((x) => !c || x.category === c);
  return NextResponse.json(
    {
      stage: stage(),
      source: products[0]?.source ?? "sample",
      orderable: products.some((p) => p.orderable),
      page: fallback.page,
      pageSize: fallback.pageSize,
      total: fallback.total,
      products,
    },
    {headers: {"Cache-Control": "no-store"}},
  );
}
