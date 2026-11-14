/**
 * Seeds demo identity + operational fixtures for DEMO_AUTH environments.
 * Safe to re-run (upserts). Never invents live payment success outside explicit DEMO capture rows.
 */
import {createHash, randomBytes} from "node:crypto";
import bcrypt from "bcryptjs";
import {prisma} from "../src/lib/db";

const ACCOUNTS = [
  {email: "admin@verse.mode", password: "VerseDemo!Admin26", kind: "STAFF" as const, staffRole: "SUPERADMIN" as const, displayName: "Demo Superadmin"},
  {email: "staff@verse.mode", password: "VerseDemo!Staff26", kind: "STAFF" as const, staffRole: "DESIGNER" as const, displayName: "Demo Designer"},
  {email: "ops@verse.mode", password: "VerseDemo!Ops26", kind: "STAFF" as const, staffRole: "OPERATIONS" as const, displayName: "Demo Operations"},
  {email: "customer@verse.mode", password: "VerseDemo!Cust26", kind: "CUSTOMER" as const, staffRole: null, displayName: "Demo Customer"},
];

async function seedIdentities() {
  for (const a of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    await prisma.demoCredential.upsert({
      where: {email: a.email},
      create: {email: a.email, passwordHash, kind: a.kind, staffRole: a.staffRole ?? undefined, displayName: a.displayName, active: true},
      update: {passwordHash, kind: a.kind, staffRole: a.staffRole ?? undefined, displayName: a.displayName, active: true},
    });
    if (a.kind === "STAFF" && a.staffRole) {
      await prisma.adminUser.upsert({
        where: {email: a.email},
        create: {email: a.email, name: a.displayName, role: a.staffRole, active: true},
        update: {name: a.displayName, role: a.staffRole, active: true},
      });
    } else {
      await prisma.customer.upsert({
        where: {email: a.email},
        create: {email: a.email, displayName: a.displayName, over18ConfirmedAt: new Date()},
        update: {displayName: a.displayName, over18ConfirmedAt: new Date()},
      });
    }
    console.log("identity", a.kind, a.email);
  }
}

async function seedPolicies() {
  const policies = [
    {policyType: "TERMS", version: "demo-1.0", content: "DEMO TERMS — not counsel-approved. Preorders manufacture after payment confirmation. Cancellation subject to production stage."},
    {policyType: "PRIVACY", version: "demo-1.0", content: "DEMO PRIVACY — not counsel-approved. We store account email, order snapshots and consents. No behavioural ads to under-18."},
    {policyType: "RETURNS", version: "demo-1.0", content: "DEMO RETURNS — not counsel-approved. Custom/preorder cancellations follow disclosed production stage rules."},
  ];
  for (const p of policies) {
    const contentSha = createHash("sha256").update(p.content).digest("hex");
    await prisma.policyVersion.upsert({
      where: {policyType_version: {policyType: p.policyType, version: p.version}},
      create: {...p, contentSha, status: "APPROVED", approvedBy: "admin@verse.mode", effectiveAt: new Date()},
      update: {content: p.content, contentSha, status: "APPROVED", approvedBy: "admin@verse.mode", effectiveAt: new Date()},
    });
  }
  console.log("policies", policies.length);
}

async function seedCatalogReady() {
  // Ensure base concepts exist
  const {execSync} = await import("node:child_process");
  try { execSync("npx tsx scripts/seed-catalog.ts", {stdio: "inherit", cwd: process.cwd(), env: process.env}); } catch { console.warn("catalog seed skipped/failed"); }

  const supplier = await prisma.supplier.upsert({
    where: {id: "demo-supplier-1"},
    create: {id: "demo-supplier-1", legalName: "DEMO Apparel Partner (unsigned)", verified: false, active: true, leadTimeDays: 18},
    update: {active: true},
  });

  const product = await prisma.product.findUnique({where: {slug: "quiet-is-a-power-move"}, include: {variants: true}});
  if (!product) { console.warn("missing quiet-is-a-power-move"); return; }

  await prisma.product.update({
    where: {id: product.id},
    data: {
      status: "PREORDER",
      hsnCode: "61091000",
      fabricComposition: "DEMO 100% cotton — sample pending supplier sign-off",
      countryOfOrigin: "IN",
      disclosure: "DEMO PREORDER — ship window is illustrative until supplier confirms.",
      sampleApprovedAt: new Date(),
      approvedBy: "admin@verse.mode",
      publishedAt: new Date(),
    },
  });

  const from = new Date(); from.setDate(from.getDate() + 14);
  const to = new Date(); to.setDate(to.getDate() + 28);

  for (const v of product.variants) {
    await prisma.productVariant.update({
      where: {id: v.id},
      data: {enabled: true, taxRateBasisPoints: 500, costPaise: v.pricePaise / 2n},
    });
    await prisma.preorderCapacity.upsert({
      where: {variantId_supplierId: {variantId: v.id, supplierId: supplier.id}},
      create: {variantId: v.id, supplierId: supplier.id, capacity: 50, reserved: 0, confirmed: true, shipWindowFrom: from, shipWindowTo: to},
      update: {capacity: 50, confirmed: true, shipWindowFrom: from, shipWindowTo: to},
    });
  }
  console.log("preorder product quiet-is-a-power-move ready");
}

async function seedStudioSamples() {
  const fp = createHash("sha256").update("demo-brief-1").digest("hex");
  const brief = await prisma.designBrief.upsert({
    where: {fingerprint: fp},
    create: {fingerprint: fp, quoteFingerprint: fp, quoteText: "SHOW UP ANYWAY.", theme: "MOTION", garmentFamily: "TEES", artFamily: "TYPE", placement: "CHEST", motif: "NONE", palette: "charcoal", fit: "OVERSIZED", state: "ASSEMBLED"},
    update: {},
  });
  const candFp = createHash("sha256").update(`cand:${fp}`).digest("hex");
  const cand = await prisma.designCandidate.upsert({
    where: {fingerprint: candFp},
    create: {fingerprint: candFp, designBriefId: brief.id, quoteText: brief.quoteText, theme: brief.theme, garmentFamily: brief.garmentFamily, artFamily: brief.artFamily, state: "NEEDS_HUMAN_REVIEW"},
    update: {state: "NEEDS_HUMAN_REVIEW"},
  });
  await prisma.designVersion.upsert({
    where: {candidateId_revision: {candidateId: cand.id, revision: 1}},
    create: {candidateId: cand.id, revision: 1, promptVersion: "demo-1", modelName: "verse-sandbox-placeholder", modelLicense: "DEMO", outputLicense: "DEMO", approvalStatus: "DRAFT"},
    update: {},
  });
  console.log("studio candidate", cand.id);
}

async function seedPromoAndStore() {
  const starts = new Date(); starts.setDate(starts.getDate() - 1);
  const ends = new Date(); ends.setDate(ends.getDate() + 60);
  await prisma.promotion.upsert({
    where: {code: "DEMO10"},
    create: {code: "DEMO10", kind: "LAUNCH", label: "Demo 10% off (not stacked)", startsAt: starts, endsAt: ends, eligibility: {demo: true}, discountRule: {percentOff: 10}, exclusive: true, active: true, maxPerCustomer: 1},
    update: {active: true, endsAt: ends},
  });
  await prisma.store.upsert({
    where: {slug: "demo-hq"},
    create: {slug: "demo-hq", name: "Demo Company Store", storeType: "COMPANY", legalOwner: "DEMO ENTITY PENDING", address: {city: "Bengaluru", note: "Pilot only"}, active: false},
    update: {},
  });
  console.log("promo + store");
}

async function seedSampleOrder() {
  const customer = await prisma.customer.findUnique({where: {email: "customer@verse.mode"}});
  const product = await prisma.product.findUnique({where: {slug: "quiet-is-a-power-move"}, include: {variants: true}});
  if (!customer || !product?.variants[0]) return;
  const variant = product.variants.find(v => v.size === "M") ?? product.variants[0];
  const publicId = "VM-DEMO-SAMPLE";
  const existing = await prisma.order.findUnique({where: {publicId}});
  if (existing) { console.log("sample order exists"); return; }

  const order = await prisma.order.create({
    data: {
      publicId,
      customerId: customer.id,
      status: "PAID",
      subtotalPaise: variant.pricePaise,
      shippingPaise: 0n,
      taxPaise: (variant.pricePaise * 500n) / 10500n,
      totalPaise: variant.pricePaise,
      addressEncrypted: JSON.stringify({demo: true, note: "DEMO ADDRESS — not real PII"}),
      legalSellerSnapshot: {name: process.env.LEGAL_SELLER_NAME || "DEMO SELLER PENDING", gstin: process.env.LEGAL_SELLER_GSTIN || "PENDING", address: process.env.LEGAL_SELLER_ADDRESS || "PENDING"},
      shippingPromise: {from: new Date(Date.now() + 14 * 864e5).toISOString(), to: new Date(Date.now() + 28 * 864e5).toISOString(), demo: true},
      acceptedPolicy: {demo: true, note: "Demo policies accepted in seed"},
      paidAt: new Date(),
      auditTrace: {seed: true, label: "DEMO_SAMPLE_ORDER"},
    },
  });
  await prisma.orderLine.create({
    data: {
      orderId: order.id,
      productId: product.id,
      variantId: variant.id,
      skuSnapshot: variant.sku,
      description: product.title,
      quantity: 1,
      unitPaise: variant.pricePaise,
      taxPaise: (variant.pricePaise * 500n) / 10500n,
      discountPaise: 0n,
      attributes: {size: variant.size, colour: variant.colour, fit: variant.fit, demo: true},
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "DEMO",
      providerOrderId: `demo_order_${randomBytes(4).toString("hex")}`,
      providerPaymentId: `demo_pay_${randomBytes(4).toString("hex")}`,
      status: "CAPTURED",
      amountPaise: variant.pricePaise,
      capturedAt: new Date(),
    },
  });
  await prisma.auditLog.create({
    data: {actor: "system:seed-demo", action: "DEMO_SAMPLE_ORDER", target: publicId, details: {notice: "Seeded demo paid order for customer dashboard"}},
  });
  console.log("sample order", publicId);
}

async function main() {
  await seedIdentities();
  await seedPolicies();
  await seedCatalogReady();
  await seedStudioSamples();
  await seedPromoAndStore();
  await seedSampleOrder();
  console.log("\nDemo logins (DEMO_AUTH only):");
  for (const a of ACCOUNTS) console.log(`  ${a.kind.padEnd(8)} ${a.email} / ${a.password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
