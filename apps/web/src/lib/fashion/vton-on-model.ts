import {getFashnVtonProvider} from "@/lib/providers/graphic";
import {createAssetStore} from "@/lib/providers/graphic/assetStore";
import type {DesignDna} from "./design-dna";
import {renderFlatGarmentForVton} from "./garment-flatlay-vton";
import {readAsPngBase64} from "./encode-image";
import {getModelIdentity} from "./model-identities";

/** Self-hosted FASHN VTON only — never FASHN paid API. */
export async function tryVtonOnModel(dna: DesignDna, idempotencyKey: string, side: "front" | "back" = "front") {
  if (process.env.FASHN_VTON_PAID_API === "true") {
    return {ok: false as const, reason: "PAID_API_BLOCKED"};
  }

  const provider = getFashnVtonProvider();
  if (provider.status !== "REMOTE") return {ok: false as const, reason: provider.status};

  const garmentPng = await renderFlatGarmentForVton(dna, side);
  const model = getModelIdentity(dna.modelIdentityId);
  const person = await readAsPngBase64(model.frontAsset);
  const category = dna.garmentFamily === "PANTS" ? "bottoms" : "tops";

  const res = await provider.generateLifestyleSimulation({
    seed: String(dna.renderSeed),
    idempotencyKey,
    category,
    garmentImageBase64: garmentPng.toString("base64"),
    garmentMimeType: "image/png",
    personImageBase64: person.base64,
    personMimeType: "image/png",
    licensedCheckpoint: process.env.AI_RENDER_LICENSED_CHECKPOINT?.trim() || "fashn-vton-1.5-unverified",
  });

  if (!res.ok) return {ok: false as const, reason: res.error.code};
  if (res.value.isSimulation || res.value.provenance?.isSimulation) {
    return {ok: false as const, reason: "SIMULATION_REJECTED"};
  }

  const store = createAssetStore(process.env.ASSET_STORAGE_DIR);
  const stored = await store.put(res.value);
  return {
    ok: true as const,
    output: res.value,
    storageKey: stored.storageKey,
    persisted: stored.persisted,
    visualKind: "ON_MODEL_VTON_FREE" as const,
  };
}