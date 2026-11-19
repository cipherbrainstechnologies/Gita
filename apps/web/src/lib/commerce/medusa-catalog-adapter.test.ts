import {describe, expect, it} from "vitest";
import {mapMedusaProduct} from "./medusa-catalog-adapter";
import type {MedusaStoreProduct} from "./medusa-client";

const base: MedusaStoreProduct = {
  id: "prod_1",
  handle: "reset-mode-track-pant",
  title: "Reset Mode Track Pant",
  thumbnail: "https://cdn.example/front.webp",
  metadata: {
    gita_category: "pants",
    gita_palette: "slate",
    gita_collection: "RESET MODE",
    gita_status: "CONCEPT",
    gita_line: "Progress is personal.",
    gita_fit: "Tapered jogger",
    gita_display_sale_ready: "true",
  },
  variants: [
    {
      id: "var_1",
      sku: "RESET-M",
      title: "Slate / M",
      calculated_price: {calculated_amount: 149900, currency_code: "inr"},
      options: [
        {option: {title: "Size"}, value: "M"},
        {option: {title: "Color"}, value: "slate"},
      ],
    },
  ],
};

describe("mapMedusaProduct", () => {
  it("maps gita metadata instead of defaulting to charcoal tee", () => {
    const mapped = mapMedusaProduct(base);
    expect(mapped.category).toBe("pants");
    expect(mapped.palette).toBe("slate");
    expect(mapped.collection).toBe("RESET MODE");
    expect(mapped.line).toBe("Progress is personal.");
    expect(mapped.fit).toBe("Tapered jogger");
    expect(mapped.displaySaleReady).toBe(true);
    expect(mapped.priceInr).toBe(1499);
  });

  it("infers pants from title when metadata category missing", () => {
    const mapped = mapMedusaProduct({
      ...base,
      metadata: {},
      title: "Motion Lab Track Pant",
    });
    expect(mapped.category).toBe("pants");
  });

  it("merges prisma enrich media over thumbnail-only medusa", () => {
    const enrichMedia = [
      {src: "/api/catalog/on-model/x", view: "front" as const, alt: "Front", simulated: true as const},
      {src: "/api/catalog/on-model/y", view: "back" as const, alt: "Back", simulated: true as const},
    ];
    const mapped = mapMedusaProduct(base, {media: enrichMedia, palette: "olive", category: "pants"});
    expect(mapped.media).toEqual(enrichMedia);
    expect(mapped.palette).toBe("slate");
  });
});