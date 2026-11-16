import type {CatalogProduct} from "../catalog";

export function productJsonLd(product: CatalogProduct, baseUrl: string) {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.designExplanation ?? product.line,
    sku: product.variants[0]?.sku,
    brand: {"@type": "Brand", name: "VERSE//MODE"},
    url: `${baseUrl}/shop/${encodeURIComponent(product.slug)}`,
  };
  if (product.orderable && product.priceInr != null) {
    payload.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.priceInr,
      availability: "https://schema.org/PreOrder",
      url: `${baseUrl}/shop/${encodeURIComponent(product.slug)}`,
    };
  }
  return payload;
}