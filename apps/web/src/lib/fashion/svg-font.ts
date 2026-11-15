import {readFileSync} from "node:fs";
import {join} from "node:path";

let cachedFace: string | null = null;

/** Embed OFL Noto Sans so Railway/Linux SVG text is not tofu boxes. */
export function svgFontFaceCss(): string {
  if (cachedFace) return cachedFace;
  const abs = join(process.cwd(), "assets", "fonts", "NotoSans-Regular.ttf");
  const b64 = readFileSync(abs).toString("base64");
  cachedFace = `@font-face{font-family:'GitaCatalog';src:url('data:font/ttf;base64,${b64}') format('truetype');font-weight:400;font-style:normal}`;
  return cachedFace;
}

export const CATALOG_FONT = "GitaCatalog, DejaVu Sans, sans-serif";
