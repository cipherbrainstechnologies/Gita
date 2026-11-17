import {z} from "zod";

const truthy = new Set(["true", "1", "yes"]);

export const commerceFlags = {
  backend(): "legacy" | "medusa" {
    const v = process.env.COMMERCE_BACKEND?.trim().toLowerCase();
    return v === "medusa" ? "medusa" : "legacy";
  },
  medusaCatalogRead(): boolean {
    return truthy.has((process.env.MEDUSA_CATALOG_READ ?? "").toLowerCase());
  },
  medusaCatalogWrite(): boolean {
    return truthy.has((process.env.MEDUSA_CATALOG_WRITE ?? "").toLowerCase());
  },
  medusaPublicCatalog(): boolean {
    return truthy.has((process.env.MEDUSA_PUBLIC_CATALOG ?? "").toLowerCase());
  },
  shadowCompare(): boolean {
    return truthy.has((process.env.MEDUSA_SHADOW_COMPARE ?? "").toLowerCase());
  },
};

export function medusaBackendUrl(): string | null {
  const url = process.env.MEDUSA_BACKEND_URL?.trim();
  if (!url) return null;
  try {
    return z.string().url().parse(url.replace(/\/$/, ""));
  } catch {
    return null;
  }
}

export function medusaPublishableKey(): string | null {
  const k = process.env.MEDUSA_PUBLISHABLE_KEY?.trim();
  return k || null;
}