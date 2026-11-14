import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import type {StaffIdentity} from "@/lib/admin";
import {ApiError} from "../shared/http";
import {writeAudit, type Db} from "../shared/audit";
import {demoAuth} from "../shared/permissions";
import type {CreateProductInput, UpdateProductInput, UpsertVariantInput} from "./catalog.schema";
import {BLOCKER_MESSAGES, VARIANT_ENABLE_STATUSES, PRODUCT_TRANSITIONS, canTransition, evaluatePreorderGate, type PreorderBlocker, type ProductStatus} from "./catalog.rules";
import * as repo from "./catalog.repository";

export type VariantDto = {
  id: string; sku: string; size: string; colour: string; fit: string;
  mrpPaise: string; pricePaise: string; costPaise: string | null; taxRateBasisPoints: number | null; enabled: boolean;
  /** Sum of (capacity - reserved) over supplier-confirmed, unexpired capacity rows. null = no confirmed capacity exists. */
  capacityRemaining: number | null;
};
export type ProductDto = {
  id: string; slug: string; title: string; description: string | null; tagline: string | null; collection: string | null; palette: string | null;
  category: string; hsnCode: string | null; status: ProductStatus; sampleApprovedAt: string | null; publishedAt: string | null; updatedAt: string;
  allowedTransitions: ProductStatus[];
  preorderGate: {ok: boolean; blockers: PreorderBlocker[]};
  variants: VariantDto[];
};

type Capacity = Awaited<ReturnType<typeof repo.capacitiesForVariants>>[number];

function toDto(p: repo.ProductRow, caps: Capacity[], now: Date): ProductDto {
  const live = caps.filter(c => c.confirmed && c.shipWindowTo > now);
  const variants: VariantDto[] = p.variants.map(v => {
    const mine = live.filter(c => c.variantId === v.id);
    return {
      id: v.id, sku: v.sku, size: v.size, colour: v.colour, fit: v.fit, mrpPaise: v.mrpPaise.toString(), pricePaise: v.pricePaise.toString(),
      costPaise: v.costPaise?.toString() ?? null, taxRateBasisPoints: v.taxRateBasisPoints, enabled: v.enabled,
      capacityRemaining: mine.length ? mine.reduce((n, c) => n + Math.max(0, c.capacity - c.reserved), 0) : null
    };
  });
  const gate = evaluatePreorderGate({hsnCode: p.hsnCode, variants: p.variants.map(v => ({id: v.id, taxRateBasisPoints: v.taxRateBasisPoints})), capacities: caps}, {demo: false, now});
  return {
    id: p.id, slug: p.slug, title: p.title, description: p.description, tagline: p.tagline, collection: p.collection, palette: p.palette,
    category: p.category, hsnCode: p.hsnCode, status: p.status, sampleApprovedAt: p.sampleApprovedAt?.toISOString() ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null, updatedAt: p.updatedAt.toISOString(),
    allowedTransitions: [...PRODUCT_TRANSITIONS[p.status]], preorderGate: {ok: gate.ok, blockers: gate.blockers}, variants
  };
}

async function loadDtos(db: Db, rows: repo.ProductRow[]): Promise<ProductDto[]> {
  const caps = await repo.capacitiesForVariants(db, rows.flatMap(r => r.variants.map(v => v.id)));
  const now = new Date();
  return rows.map(r => toDto(r, caps.filter(c => r.variants.some(v => v.id === c.variantId)), now));
}

export async function listCatalog(): Promise<ProductDto[]> {
  return loadDtos(prisma, await repo.listProducts(prisma));
}

async function dtoById(db: Db, id: string): Promise<ProductDto> {
  const row = await repo.findProductWithVariants(db, id);
  if (!row) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  return (await loadDtos(db, [row]))[0];
}

export async function createProduct(staff: StaffIdentity, input: CreateProductInput): Promise<ProductDto> {
  return prisma.$transaction(async tx => {
    const created = await repo.createProduct(tx, {
      slug: input.slug, title: input.title, description: input.description ?? null, tagline: input.tagline ?? null, collection: input.collection ?? null,
      palette: input.palette ?? null, category: input.category, audienceFit: input.audienceFit, hsnCode: input.hsnCode ?? null,
      fabricComposition: input.fabricComposition ?? null, gsm: input.gsm ?? null, countryOfOrigin: input.countryOfOrigin ?? null,
      // New products are ALWAYS concepts; the disclosure keeps the storefront honest until a sample is approved.
      disclosure: input.disclosure ?? "Concept only. No physical sample, supplier confirmation or stock exists.", status: "CONCEPT"
    });
    await writeAudit(tx, staff, "PRODUCT_CREATED", created.id, {slug: created.slug});
    return dtoById(tx, created.id);
  });
}

const FIELD_KEYS = ["title", "description", "tagline", "collection", "palette", "hsnCode", "fabricComposition", "gsm", "countryOfOrigin", "disclosure"] as const;

export async function updateProduct(staff: StaffIdentity, input: UpdateProductInput): Promise<ProductDto> {
  if (input.demoAllowPreorder && !demoAuth()) throw new ApiError(403, "DEMO_DISABLED", "demoAllowPreorder is only honoured when DEMO_AUTH=true.");
  const fieldData: Record<string, unknown> = {};
  for (const k of FIELD_KEYS) if (input[k] !== undefined) fieldData[k] = input[k];
  if (!Object.keys(fieldData).length && !input.status) throw new ApiError(422, "NO_CHANGES", "Nothing to update.");

  return prisma.$transaction(async tx => {
    const product = await repo.findProductWithVariants(tx, input.id);
    if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    if (product.status === "ARCHIVED") throw new ApiError(409, "PRODUCT_ARCHIVED", "Archived products are immutable.");
    const nextHsn = input.hsnCode !== undefined ? input.hsnCode : product.hsnCode;
    if (product.status === "PREORDER" && !nextHsn) throw new ApiError(409, "HSN_REQUIRED_WHILE_PREORDER", "HSN cannot be cleared while the product is open for preorder.");

    const data: Prisma.ProductUncheckedUpdateManyInput = {...fieldData};
    const to = input.status && input.status !== product.status ? input.status : null;
    let demoBypass = false;
    if (to) {
      if (!canTransition(product.status, to)) {
        throw new ApiError(409, "INVALID_TRANSITION", `Cannot move ${product.status} to ${to}.`, {from: product.status, to, allowed: PRODUCT_TRANSITIONS[product.status]});
      }
      if (to === "PREORDER") {
        const caps = await repo.capacitiesForVariants(tx, product.variants.map(v => v.id));
        const gate = evaluatePreorderGate(
          {hsnCode: nextHsn, variants: product.variants.map(v => ({id: v.id, taxRateBasisPoints: v.taxRateBasisPoints})), capacities: caps},
          {demo: Boolean(input.demoAllowPreorder) && demoAuth(), now: new Date()}
        );
        if (!gate.ok) throw new ApiError(409, "PREORDER_GATE_FAILED", "Product does not meet the preorder requirements.", gate.blockers.map(b => ({code: b, message: BLOCKER_MESSAGES[b]})));
        demoBypass = gate.demoBypassUsed;
        data.publishedAt = product.publishedAt ?? new Date();
      }
      data.status = to;
      if (to === "SAMPLE_APPROVED") { data.sampleApprovedAt = new Date(); data.approvedBy = staff.email; }
      if (product.status === "SAMPLE_APPROVED" && (to === "SAMPLE_PENDING" || to === "CONCEPT")) { data.sampleApprovedAt = null; data.approvedBy = null; }
      // Rolling back or archiving must never leave purchasable-looking variants behind.
      if (to === "CONCEPT" || to === "SAMPLE_PENDING" || to === "ARCHIVED") await repo.disableVariantsOfProduct(tx, product.id);
    }

    if ((await repo.updateProductGuarded(tx, product.id, product.status, data)) !== 1) {
      throw new ApiError(409, "CONCURRENT_UPDATE", "The product changed while you were editing. Reload and retry.");
    }
    if (Object.keys(fieldData).length) await writeAudit(tx, staff, "PRODUCT_UPDATED", product.id, {fields: Object.keys(fieldData)});
    if (to) await writeAudit(tx, staff, "PRODUCT_STATUS_CHANGED", product.id, {from: product.status, to, reason: input.reason ?? null, demoBypass});
    return dtoById(tx, product.id);
  });
}

function assertEnableAllowed(status: ProductStatus, taxRate: number | null) {
  if (!VARIANT_ENABLE_STATUSES.includes(status)) throw new ApiError(409, "PRODUCT_NOT_APPROVED", `Variants can only be enabled once the sample is approved (product is ${status}).`);
  if (taxRate == null) throw new ApiError(409, "TAX_RATE_REQUIRED", "Set a tax rate (basis points) before enabling a variant.");
}

export async function upsertVariant(staff: StaffIdentity, input: UpsertVariantInput): Promise<{created: boolean; variant: VariantDto; product: ProductDto}> {
  return prisma.$transaction(async tx => {
    const product = await repo.findProduct(tx, input.productId);
    if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    if (product.status === "CLOSED" || product.status === "ARCHIVED") throw new ApiError(409, "PRODUCT_CLOSED", `Variants of a ${product.status} product cannot be changed.`);
    const existing = await repo.findVariantBySku(tx, input.sku);
    if (existing && existing.productId !== product.id) throw new ApiError(409, "SKU_TAKEN", "This SKU belongs to a different product.");

    const finalTax = input.taxRateBasisPoints !== undefined ? input.taxRateBasisPoints : existing?.taxRateBasisPoints ?? null;
    const finalEnabled = input.enabled ?? existing?.enabled ?? false;
    if (input.enabled === true) assertEnableAllowed(product.status, finalTax);
    else if (finalEnabled && finalTax == null) throw new ApiError(409, "TAX_RATE_REQUIRED", "An enabled variant must keep a tax rate.");

    const base = {
      size: input.size, colour: input.colour, fit: input.fit, mrpPaise: input.mrpPaise, pricePaise: input.pricePaise, currency: "INR",
      costPaise: input.costPaise !== undefined ? input.costPaise : existing?.costPaise ?? null, taxRateBasisPoints: finalTax, enabled: finalEnabled
    };
    const now = new Date();
    let variantId: string;
    let priceChanged = false;
    if (!existing) {
      const v = await repo.createVariant(tx, {...base, productId: product.id, sku: input.sku, enabled: finalEnabled});
      variantId = v.id;
      await repo.addPriceHistory(tx, {variantId, sellPaise: input.pricePaise, startAt: now, actorId: staff.email});
    } else {
      variantId = existing.id;
      priceChanged = existing.pricePaise !== input.pricePaise;
      if (priceChanged) {
        // 30-day price comparator (E16) needs the prior price on record even for seeded variants that never had history.
        if ((await repo.priceHistoryCount(tx, variantId)) === 0) await repo.addPriceHistory(tx, {variantId, sellPaise: existing.pricePaise, startAt: existing.createdAt, endAt: now, actorId: null});
        else await repo.closeOpenPriceHistory(tx, variantId, now);
        await repo.addPriceHistory(tx, {variantId, sellPaise: input.pricePaise, previousPaise: existing.pricePaise, startAt: now, actorId: staff.email});
      }
      await repo.updateVariant(tx, variantId, base);
    }
    await writeAudit(tx, staff, "VARIANT_UPSERTED", input.sku, {productId: product.id, created: !existing, priceChanged, enabled: finalEnabled, pricePaise: input.pricePaise.toString()});
    const dto = await dtoById(tx, product.id);
    return {created: !existing, variant: dto.variants.find(v => v.id === variantId)!, product: dto};
  });
}

export async function setVariantEnabled(staff: StaffIdentity, input: {sku: string; enabled: boolean}): Promise<ProductDto> {
  return prisma.$transaction(async tx => {
    const v = await repo.findVariantBySku(tx, input.sku);
    if (!v) throw new ApiError(404, "VARIANT_NOT_FOUND", "Variant not found.");
    if (input.enabled) {
      if (v.product.status === "CLOSED" || v.product.status === "ARCHIVED") throw new ApiError(409, "PRODUCT_CLOSED", "Product is closed.");
      assertEnableAllowed(v.product.status, v.taxRateBasisPoints);
    }
    if (v.enabled !== input.enabled) {
      await repo.updateVariant(tx, v.id, {enabled: input.enabled});
      await writeAudit(tx, staff, "VARIANT_ENABLED_CHANGED", v.sku, {productId: v.productId, enabled: input.enabled});
    }
    return dtoById(tx, v.productId);
  });
}
