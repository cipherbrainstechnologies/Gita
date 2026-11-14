import {access, readFile} from "node:fs/promises";
import {join} from "node:path";
import {NextResponse} from "next/server";

/** Serves approved WebP/PNG from ASSET_STORAGE_DIR — no GPU at request time. */
export async function GET(_req: Request, ctx: {params: Promise<{key: string[]}>}) {
  const {key} = await ctx.params;
  const root = process.env.ASSET_STORAGE_DIR?.trim();
  if (!root) return NextResponse.json({error: "STORAGE_NOT_MOUNTED"}, {status: 503});

  const rel = key.join("/").replace(/\.\./g, "");
  const abs = join(root, "catalog", rel.startsWith("catalog/") ? rel.replace(/^catalog\//, "") : rel);
  if (!abs.startsWith(join(root, "catalog"))) {
    return NextResponse.json({error: "INVALID_PATH"}, {status: 400});
  }
  try {
    await access(abs);
  } catch {
    return NextResponse.json({error: "NOT_FOUND"}, {status: 404});
  }

  const bytes = await readFile(abs);
  const isWebp = abs.endsWith(".webp");
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": isWebp ? "image/webp" : "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Gita-Asset-Source": "persistent-volume",
    },
  });
}