import {copyFileSync, existsSync, mkdirSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

let cachedFace: string | null = null;
let resolvedFontPath: string | null = null;

function candidateFontPaths(): string[] {
  const file = "NotoSans-Regular.ttf";
  return [
    join(process.cwd(), "public", "fonts", file),
    join(process.cwd(), "assets", "fonts", file),
    join(process.cwd(), "apps", "web", "public", "fonts", file),
    join(process.cwd(), "apps", "web", "assets", "fonts", file),
    join(__dirname, "..", "..", "..", "public", "fonts", file),
    join(__dirname, "..", "..", "..", "assets", "fonts", file),
  ];
}

function resolveFontFile(): string | null {
  if (resolvedFontPath && existsSync(resolvedFontPath)) return resolvedFontPath;
  for (const p of candidateFontPaths()) {
    if (!existsSync(p)) continue;
    try {
      const destDir = join(tmpdir(), "gita-fonts");
      mkdirSync(destDir, {recursive: true});
      const dest = join(destDir, "NotoSans-Regular.ttf");
      if (!existsSync(dest)) copyFileSync(p, dest);
      resolvedFontPath = dest;
      return dest;
    } catch {
      resolvedFontPath = p;
      return p;
    }
  }
  return null;
}

/** Custom face via file:// when available; empty string if missing (never throws). */
export function svgFontFaceCss(): string {
  if (cachedFace !== null) return cachedFace;
  try {
    const fontPath = resolveFontFile();
    if (!fontPath) {
      cachedFace = "";
      return cachedFace;
    }
    const href = fontPath.replace(/\\/g, "/");
    const fileUrl = href.startsWith("/") ? `file://${href}` : `file:///${href}`;
    cachedFace = `@font-face{font-family:'GitaCatalog';src:url('${fileUrl}') format('truetype');font-weight:400;font-style:normal}`;
    return cachedFace;
  } catch {
    cachedFace = "";
    return cachedFace;
  }
}

export const CATALOG_FONT = "GitaCatalog, DejaVu Sans, Liberation Sans, Arial, sans-serif";
