import {readFile} from "node:fs/promises";
import {join} from "node:path";
import sharp from "sharp";

/** Always emit true PNG bytes when declaring image/png to VTON adapters. */
export async function readAsPngBase64(publicUrlPath: string): Promise<{base64: string; mime: "image/png"}> {
  const path = join(process.cwd(), "public", publicUrlPath.replace(/^\//, ""));
  const buf = await readFile(path);
  const png = await sharp(buf).png().toBuffer();
  return {base64: png.toString("base64"), mime: "image/png"};
}