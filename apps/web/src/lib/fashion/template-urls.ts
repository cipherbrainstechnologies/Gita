/** Shared editorial assets — must never be approved as product-specific on-model media for concept SKUs. */
export const SHARED_TEMPLATE_URLS = new Set([
  "/images/quiet-power-editorial-front.webp",
  "/images/quiet-power-editorial-back.webp",
  "/images/quiet-power-editorial-detail.webp",
  "/images/quiet-power-editorial-side.jpg",
  "/images/quiet-power-editorial-front.jpg",
  "/images/quiet-power-editorial-front-back.webp",
  "/images/quiet-power-editorial-print-proof.jpg",
  "/images/karma-editorial-back.webp",
  "/images/karma-editorial-front.webp",
  "/images/karma-editorial-front-back.webp",
]);

export function isSharedTemplateUrl(url: string): boolean {
  const path = url.startsWith("http") ? new URL(url).pathname : url;
  return SHARED_TEMPLATE_URLS.has(path);
}