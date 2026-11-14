import {z} from "zod";

const MAX_PAISE = 100_000_000n; // ₹10,00,000 per unit: guards typos, not a business ceiling
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
/** Optional text: empty string clears to null; undefined leaves the column untouched. */
const text = (max: number) => z.string().trim().max(max).transform(s => (s === "" ? null : s)).nullable().optional();
const hsn = z.string().trim().regex(/^\d{4}(\d{2}){0,2}$/, "HSN must be 4, 6 or 8 digits").nullable().optional();

export const paiseSchema = z.union([z.number().int(), z.string().regex(/^\d{1,12}$/)])
  .transform(v => BigInt(v))
  .refine(v => v >= 0n && v <= MAX_PAISE, "Price out of range");

export const statusSchema = z.enum(["CONCEPT", "SAMPLE_PENDING", "SAMPLE_APPROVED", "PREORDER", "CLOSED", "ARCHIVED"]);

export const createProductSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(160),
  description: text(4000),
  tagline: text(200),
  collection: text(120),
  palette: text(60),
  category: z.enum(["tees", "pants"]),
  audienceFit: z.string().trim().min(2).max(40).default("ADULT_UNISEX"),
  hsnCode: hsn,
  fabricComposition: text(200),
  gsm: z.number().int().min(60).max(800).nullable().optional(),
  countryOfOrigin: text(80),
  disclosure: text(1000)
}).strict();

export const updateProductSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().trim().min(2).max(160).optional(),
  description: text(4000),
  tagline: text(200),
  collection: text(120),
  palette: text(60),
  hsnCode: hsn,
  fabricComposition: text(200),
  gsm: z.number().int().min(60).max(800).nullable().optional(),
  countryOfOrigin: text(80),
  disclosure: text(1000),
  status: statusSchema.optional(),
  reason: z.string().trim().min(3).max(500).optional(),
  /** Honoured only when DEMO_AUTH==='true'; rejected with 403 otherwise. */
  demoAllowPreorder: z.boolean().optional()
}).strict();

export const upsertVariantSchema = z.object({
  productId: z.string().min(1).max(40),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,159}$/),
  size: z.string().trim().toUpperCase().min(1).max(8),
  colour: z.string().trim().min(1).max(60),
  fit: z.string().trim().min(1).max(60),
  mrpPaise: paiseSchema,
  pricePaise: paiseSchema,
  costPaise: paiseSchema.nullable().optional(),
  taxRateBasisPoints: z.number().int().min(0).max(2800).nullable().optional(),
  enabled: z.boolean().optional()
}).strict().refine(v => v.pricePaise > 0n, {message: "Price must be positive", path: ["pricePaise"]})
  .refine(v => v.mrpPaise >= v.pricePaise, {message: "MRP must be >= selling price", path: ["mrpPaise"]});

export const setVariantEnabledSchema = z.object({sku: z.string().trim().toUpperCase().min(3).max(160), enabled: z.boolean()}).strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpsertVariantInput = z.infer<typeof upsertVariantSchema>;

