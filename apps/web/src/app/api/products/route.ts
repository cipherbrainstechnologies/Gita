import {NextRequest, NextResponse} from "next/server";
import {getCatalogProducts} from "@/lib/catalog";
import {stage} from "@/lib/config";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const c = req.nextUrl.searchParams.get("category");
  const all = await getCatalogProducts();
  const products = all.filter(x => !c || x.category === c);
  return NextResponse.json(
    {stage: stage(), source: all[0]?.source ?? "sample", orderable: products.some(p => p.orderable), products},
    {headers: {"Cache-Control": "no-store"}}
  );
}
