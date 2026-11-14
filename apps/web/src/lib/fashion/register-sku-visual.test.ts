import {describe, expect, it} from "vitest";
import {registerSkuVisuals} from "./register-sku-visual";
import type {PrismaClient} from "@prisma/client";

describe("registerSkuVisuals idempotency", () => {
  it("upserts the same asset keys when called twice", async () => {
    const store = new Map<string, unknown>();
    const prisma = {
      productMediaV2: {
        upsert: async ({where, create, update}: {where: {productId_mediaRole_assetSha256: unknown}; create: unknown; update: unknown}) => {
          const key = JSON.stringify(where.productId_mediaRole_assetSha256);
          store.set(key, store.has(key) ? update : create);
          return store.get(key);
        },
      },
      product: {
        update: async () => ({id: "p1"}),
      },
    } as unknown as PrismaClient;

    const input = {
      id: "p1",
      slug: "vmb-test-001",
      tagline: "Stay soft. Move sharp.",
      language: "en",
      garmentFamily: "TEES",
      category: "tees",
      designBriefFingerprint: "brief-fp-test-001",
      conceptMeta: {placement: "CHEST"},
      palette: "charcoal",
    };
    const index = new Map<string, string>();
  await registerSkuVisuals(prisma, input, index);
  const firstKeys = [...store.keys()];
  await registerSkuVisuals(prisma, input, index);
  const secondKeys = [...store.keys()];
  expect(firstKeys.sort()).toEqual(secondKeys.sort());
  expect(index.size).toBe(3);
  });
});