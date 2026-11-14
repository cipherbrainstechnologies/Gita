/**
 * Idempotently imports 1,000 design briefs into Product + six disabled ProductVariant rows each.
 * Does NOT enable variants, open preorders or mutate non-CONCEPT products that staff have advanced.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import type {ProductStatus} from "@prisma/client";
import {disconnectDb} from "../src/lib/db-lifecycle";
import {prisma} from "../src/lib/db";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const DISCLOSURE =
  "Concept SKU only — synthetic editorial phrase pending human review. Not scripture. No physical sample, licensed on-model photography or supplier proof. Price is illustrative; payment and preorders stay disabled until readiness gates pass.";

function parseCsv(path: string) {
  const text = readFileSync(resolve(process.cwd(), path), "utf8");
  const lines = text.trim().split(/\r?\n/);
  const headers = parseLine(lines.shift()!);
  return lines.map((line) => Object.fromEntries(parseLine(line).map((v, i) => [headers[i], v])));
}
function parseLine(line: string) {
  const out: string[] = [];
  let item = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        item += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      out.push(item);
      item = "";
    } else item += c;
  }
  out.push(item);
  return out;
}

function categoryOf(garment: string) {
  return garment === "PANTS" ? "pants" : "tees";
}

function titleOf(theme: string, garment: string, quote: string) {
  const excerpt = quote.length > 72 ? `${quote.slice(0, 69).trim()}…` : quote;
  return `${theme.replace(/_/g, " ")} · ${garment === "PANTS" ? "Track Pant" : "Tee"} — ${excerpt}`;
}

function illustrativePricePaise(garment: string) {
  return BigInt(garment === "PANTS" ? 139_900 : 99_900);
}

async function main() {
  const briefs = parseCsv("data/design_briefs_1000.csv");
  const verses = parseCsv("data/verses_1000_drafts.csv");
  const langByQuoteFp = new Map(verses.map((v) => [v.fingerprint, v.language]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const b of briefs) {
    const slug = b.id.trim().toLowerCase();
    const language = langByQuoteFp.get(b.quote_fingerprint) ?? "en";
    const category = categoryOf(b.garment_family);
    const pricePaise = illustrativePricePaise(b.garment_family);
    const meta = {
      title: titleOf(b.theme, b.garment_family, b.quote_text),
      collection: `${b.theme.replace(/_/g, " ")} / CONCEPT SERIES`,
      tagline: b.quote_text,
      palette: b.palette.replace("/", " ").toLowerCase(),
      category,
      audienceFit: "ADULT_UNISEX",
      theme: b.theme,
      language,
      garmentFamily: b.garment_family,
      placement: b.placement,
      artFamily: b.art_family,
      quoteFingerprint: b.quote_fingerprint,
      designBriefFingerprint: b.fingerprint,
      conceptMeta: {
        quoteFingerprint: b.quote_fingerprint,
        briefId: b.id,
        motif: b.motif,
        fit: b.fit,
        imageStatus: b.image_status,
        printReady: b.print_ready,
        editorialApproval: b.editorial_approval,
        vendorApproval: b.vendor_approval,
        quoteOrigin: "ORIGINAL_DRAFT_NOT_AUTHENTICATED_CLASSICAL",
      },
      description: `${b.quote_text}\n\nEditorial draft — not published scripture. Motif: ${b.motif}. Placement: ${b.placement}. Print technique: ${b.art_family}.`,
      disclosure: DISCLOSURE,
    };

    const existing = await prisma.product.findFirst({where: {OR: [{slug}, {designBriefFingerprint: b.fingerprint}]}});
    let productId: string;
    if (!existing) {
      const product = await prisma.product.create({
        data: {...meta, slug, status: "CONCEPT" as ProductStatus},
      });
      productId = product.id;
      created++;
    } else if (existing.status !== "CONCEPT") {
      skipped++;
      continue;
    } else {
      await prisma.product.update({where: {id: existing.id}, data: meta});
      productId = existing.id;
      updated++;
    }

    for (const size of SIZES) {
      const sku = `VM-${slug.toUpperCase()}-${size}`;
      await prisma.productVariant.upsert({
        where: {sku},
        create: {
          productId,
          sku,
          size,
          colour: meta.palette,
          fit: b.fit,
          mrpPaise: pricePaise,
          pricePaise,
          currency: "INR",
          enabled: false,
        },
        update: {},
      });
    }
  }

  const count = await prisma.product.count({where: {designBriefFingerprint: {not: null}}});
  const variants = await prisma.productVariant.count({
    where: {product: {designBriefFingerprint: {not: null}}},
  });
  console.log(
    JSON.stringify(
      {briefs: briefs.length, conceptProducts: count, conceptVariants: variants, created, updated, skippedStaffAdvanced: skipped},
      null,
      2,
    ),
  );
  if (count !== briefs.length) {
    console.error(`Expected ${briefs.length} concept products, found ${count}`);
    process.exitCode = 1;
  }

  await prisma.depositPolicy.upsert({
    where: {id: "default"},
    create: {id: "default", enabled: false, flatDepositPaise: 9900n, pauseDepositCheckout: true, updatedAt: new Date()},
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());