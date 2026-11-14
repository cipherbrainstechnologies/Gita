import {z} from "zod";

/** Only COMPANY stores can be created: there is deliberately no storeType input. Franchise contracts are blocked by legal (E21). */
export const createCompanyStoreSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
  name: z.string().trim().min(2).max(120),
  legalOwner: z.string().trim().min(2).max(160),
  address: z.object({
    line1: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().regex(/^\d{6}$/)
  }).strict(),
  gstin: z.string().trim().toUpperCase().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Invalid GSTIN format").nullable().optional()
}).strict();
export type CreateCompanyStoreInput = z.infer<typeof createCompanyStoreSchema>;
