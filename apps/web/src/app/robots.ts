import type {MetadataRoute} from "next";

const base = process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "https://web-production-b2b81db7.up.railway.app";
const noIndex = process.env.PREVIEW_MODE === "true" || process.env.NODE_ENV !== "production";

export default function robots(): MetadataRoute.Robots {
  if (noIndex) {
    return {rules: {userAgent: "*", disallow: "/"}, sitemap: `${base}/sitemap.xml`};
  }
  return {
    rules: [
      {userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/checkout", "/cart", "/account"]},
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}