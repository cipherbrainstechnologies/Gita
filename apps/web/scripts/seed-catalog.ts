/**
 * Upserts editorial sample concepts into Product + ProductVariant as CONCEPT, enabled=false.
 * Idempotent and non-destructive: re-running refreshes descriptive text only and NEVER changes
 * status, price, enabled flag or capacity of rows that merchandisers have since edited.
 * Prices are illustrative targets in integer paise; no stock or capacity is created.
 */
import {prisma} from "../src/lib/db";
import {sampleConcepts} from "../src/lib/catalog";

const DISCLOSURE = "Concept only. No physical sample, supplier confirmation or stock exists. Price is illustrative, not an offer.";

async function main() {
  for (const c of sampleConcepts) {
    const pricePaise = BigInt(Math.round(c.priceInr * 100));
    const meta = {title: c.name, collection: c.collection, tagline: c.line, palette: c.palette, category: c.category, disclosure: DISCLOSURE};
    const product = await prisma.product.upsert({
      where: {slug: c.slug},
      create: {slug: c.slug, ...meta, audienceFit: "ADULT_UNISEX", status: "CONCEPT"},
      update: meta
    });
    for (const size of c.sizes) {
      await prisma.productVariant.upsert({
        where: {sku: `VM-${c.slug.toUpperCase()}-${size}`},
        create: {productId: product.id, sku: `VM-${c.slug.toUpperCase()}-${size}`, size, colour: c.palette, fit: c.fit, mrpPaise: pricePaise, pricePaise, currency: "INR", enabled: false},
        update: {}
      });
    }
    console.log(`upserted ${c.slug} (${c.sizes.length} variants, CONCEPT, disabled)`);
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
