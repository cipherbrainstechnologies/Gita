import {getFashnVtonProvider} from "@/lib/providers/graphic";
import {createAssetStore} from "@/lib/providers/graphic/assetStore";
import type {DesignDna} from "./design-dna";
import {getModelIdentity} from "./model-identities";
import {renderArtworkPng} from "./artwork-raster";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import sharp from "sharp";

async function flatGarmentPng(dna: DesignDna): Promise<{base64: string; mime: "image/png"}> {
  const art = await renderArtworkPng(dna);
  const padded = await sharp(art.bytes)
    .extend({
      top: 80,
      bottom: 80,
      left: 80,
      right: 80,
      background: dna.colourHex,
    })
  .png()
    .toBuffer();
  return {base64: padded.toString("base64"), mime: "image/png"};
}

async function personPng(modelId: string): Promise<{base64: string; mime: "image/png"} | null> {
  const model = getModelIdentity(modelId);
  const path = join(process.cwd(), "public", model.frontAsset.replace(/^\//, ""));
  const buf = await readFile(path);
  return {base64: buf.toString("base64"), mime: "image/png"};
}

/** FASHN VTON when configured; returns null if unavailable or simulation (never storefront-publish simulation). */
export async function tryVtonOnModel(dna: DesignDna, idempotencyKey: string) {
  const provider = getFashnVtonProvider();
  if (provider.status !== "REMOTE") return {ok: false as const, reason: provider.status};

  const garment = await flatGarmentPng(dna);
  const person = await personPng(dna.modelIdentityId);
  const category = dna.garmentFamily === "PANTS" ? "bottoms" : "tops";

  const res = await provider.generateLifestyleSimulation({
    seed: String(dna.renderSeed),
    idempotencyKey,
    category,
    garmentImageBase64: garment.base64,
    garmentMimeType: garment.mime,
    personImageBase64: person?.base64,
    personMimeType: person?.mime,
    licensedCheckpoint: process.env.AI_RENDER_LICENSED_CHECKPOINT?.trim() || "fashn-vton-1.5-unverified",
  });

  if (!res.ok || res.value.isSimulation) {
    return {ok: false as const, reason: res.ok ? "SIMULATION" : res.error.code};
  }

  const store = createAssetStore(process.env.ASSET_STORAGE_DIR);
  const stored = await store.put(res.value);
  return {ok: true as const, output: res.value, storageKey: stored.storageKey, persisted: stored.persisted};
}