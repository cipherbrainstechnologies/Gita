import {mkdir, writeFile, access} from "node:fs/promises";
import {dirname, join} from "node:path";
import {staticOnModelPath} from "./render-on-model-raster";

export async function persistSkuWebp(
  slug: string,
  view: string,
  bytes: Buffer,
  sha256: string,
): Promise<{persisted: boolean; fileUrl: string; storageKey: string}> {
  const rel = `${slug}/${view}-${sha256.slice(0, 16)}.webp`;
  const storageKey = rel;
  const root = process.env.ASSET_STORAGE_DIR?.trim();
  if (!root) {
    return {persisted: false, fileUrl: `/api/catalog/on-model/${slug}/${view}`, storageKey};
  }
  const abs = join(root, "catalog", rel);
  try {
    await access(abs);
    return {persisted: true, fileUrl: staticOnModelPath(storageKey), storageKey};
  } catch {
    await mkdir(dirname(abs), {recursive: true});
    await writeFile(abs, bytes);
    return {persisted: true, fileUrl: staticOnModelPath(storageKey), storageKey};
  }
}