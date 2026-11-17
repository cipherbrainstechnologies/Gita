import type {MetadataRoute} from "next";
import {getCatalogProducts} from "@/lib/catalog";

const base = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "https://web-production-b2b81db7.up.railway.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {url: `${base}/`, changeFrequency: "weekly", priority: 1},
    {url: `${base}/shop`, changeFrequency: "daily", priority: 0.9},
    {url: `${base}/journal`, changeFrequency: "weekly", priority: 0.5},
    {url: `${base}/policies`, changeFrequency: "monthly", priority: 0.4},
    {url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4},
  ];

  const products = await getCatalogProducts();
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.source !== "sample" || p.slug === "karma-action-oversized-tee")
    .slice(0, 200)
    .map((p) => ({
      url: `${base}/shop/${encodeURIComponent(p.slug)}`,
      changeFrequency: "weekly" as const,
      priority: p.orderable ? 0.8 : 0.5,
    }));

  return [...staticRoutes, ...productRoutes];
}