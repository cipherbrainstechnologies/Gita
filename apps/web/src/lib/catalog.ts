import type {Prisma} from "@prisma/client";
import {withTimeout} from "./config";

export type ConceptMedia = {
  src: string;
  view: "front" | "back" | "side" | "combined" | "detail" | "lifestyle" | "on-model" | "print-proof";
  alt: string;
  simulated: true;
};

export type DemoProduct = {
  slug: string;
  name: string;
  collection: string;
  category: "tees" | "pants";
  line: string;
  palette: string;
  priceInr: number;
  fit: string;
  sizes: string[];
  approved: false;
  media?: ConceptMedia[];
  verseReference?: string;
  sourceUrl?: string;
  designExplanation?: string;
  fabricTarget?: string;
};

/** Editorial previews only. Not physical goods or approved preorders. */
export const sampleConcepts: DemoProduct[] = [
  {
    slug: "karma-action-oversized-tee",
    name: "Karma / Action Oversized Tee",
    collection: "GITA / THE ACTION EDIT",
    category: "tees",
    line: "DO THE WORK. RELEASE THE RESULT.",
    palette: "charcoal",
    priceInr: 1199,
    fit: "Proposed unisex oversized silhouette",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
    verseReference: "Bhagavad Gita 2.47",
    sourceUrl: "https://heritage.iitk.ac.in/SBG/2.47",
    designExplanation:
      "Original contemporary interpretation inspired by Bhagavad Gita 2.47; not a literal English translation or a physical photographed product.",
    fabricTarget:
      "Proposed 100% cotton, 220–240 GSM, subject to actual fabric testing and supplier confirmation.",
    media: [
      {
        src: "/images/karma-editorial-front-back.webp",
        view: "combined",
        alt: "AI-generated on-model concept with original Karma / Action chest and mountain-inspired back graphic",
        simulated: true,
      },
      {
        src: "/images/karma-editorial-front.webp",
        view: "front",
        alt: "AI-generated concept view of the front of the Karma / Action oversized tee",
        simulated: true,
      },
      {
        src: "/images/karma-editorial-back.webp",
        view: "back",
        alt: "AI-generated concept view of the back artwork of the Karma / Action oversized tee",
        simulated: true,
      },
    ],
  },
  {
    slug: "quiet-is-a-power-move",
    name: "Quiet Power Oversized Tee",
    collection: "STATIC / NOISE",
    category: "tees",
    line: "QUIET IS A POWER MOVE.",
    palette: "charcoal",
    priceInr: 999,
    fit: "Proposed unisex oversized silhouette",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
    designExplanation:
      "Original editorial slogan. AI-simulated apparel photography — not a physical sample or supplier-approved garment.",
    fabricTarget:
      "Proposed 100% cotton, 220–240 GSM, subject to actual fabric testing and supplier confirmation.",
    media: [
      {
        src: "/images/quiet-power-editorial-front.webp",
        view: "front",
        alt: "AI-simulated front view of Quiet Power oversized tee with left-chest typography",
        simulated: true,
      },
      {
        src: "/images/quiet-power-editorial-back.webp",
        view: "back",
        alt: "AI-simulated back view of Quiet Power oversized tee with back typography",
        simulated: true,
      },
      {
        src: "/images/quiet-power-editorial-side.jpg",
        view: "side",
        alt: "AI-simulated three-quarter side view of Quiet Power oversized tee on model",
        simulated: true,
      },
      {
        src: "/images/quiet-power-editorial-detail.webp",
        view: "detail",
        alt: "AI-simulated detail close-up of Quiet Power chest print on charcoal cotton",
        simulated: true,
      },
      {
        src: "/images/quiet-power-editorial-front-back.webp",
        view: "on-model",
        alt: "AI-simulated on-model concept photography for Quiet Power",
        simulated: true,
      },
      {
        src: "/images/quiet-power-editorial-print-proof.jpg",
        view: "print-proof",
        alt: "AI-simulated flat print-placement proof for Quiet Power chest typography",
        simulated: true,
      },
    ],
  },
  {
    slug: "less-proving",
    name: "Less Proving Relaxed Tee",
    collection: "UNFINISHED",
    category: "tees",
    line: "LESS PROVING. MORE BECOMING.",
    palette: "sand",
    priceInr: 1099,
    fit: "Relaxed concept",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
  },
  {
    slug: "train-the-habit",
    name: "Train The Habit Track Pant",
    collection: "MOTION > MOTIVATION",
    category: "pants",
    line: "TRAIN THE HABIT / NOT THE HIGHLIGHT",
    palette: "slate",
    priceInr: 1499,
    fit: "Straight concept",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
  },
  {
    slug: "real-friends-question",
    name: "Honest Friend Tee",
    collection: "FRENEMY?",
    category: "tees",
    line: "REAL FRIENDS QUESTION THE SCRIPT.",
    palette: "muted-lilac",
    priceInr: 999,
    fit: "Boxy concept",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
  },
  {
    slug: "progress-is-personal",
    name: "Progress Is Personal Track Pant",
    collection: "RESET",
    category: "pants",
    line: "PROGRESS IS PERSONAL.",
    palette: "olive",
    priceInr: 1399,
    fit: "Tapered concept",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
  },
  {
    slug: "offline-not-absent",
    name: "Offline Not Absent Tee",
    collection: "AFTER CLASS",
    category: "tees",
    line: "OFFLINE ≠ ABSENT.",
    palette: "clay",
    priceInr: 899,
    fit: "Standard concept",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    approved: false,
  },
];

export type CatalogStatus =
  | "CONCEPT"
  | "SAMPLE_PENDING"
  | "SAMPLE_APPROVED"
  | "PREORDER"
  | "CLOSED"
  | "ARCHIVED";

export type CatalogVariant = {
  sku: string;
  size: string;
  pricePaise: string;
  enabled: boolean;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  collection: string;
  category: string;
  line: string;
  palette: string;
  fit: string;
  sizes: string[];
  priceInr: number | null;
  status: CatalogStatus;
  /** True ONLY when status === PREORDER and at least one variant is enabled. */
  orderable: boolean;
  source: "db" | "sample";
  variants: CatalogVariant[];
  media?: ConceptMedia[];
  theme?: string;
  language?: string;
  audienceFit?: string;
  disclosure?: string;
  verseReference?: string;
  sourceUrl?: string;
  designExplanation?: string;
  fabricTarget?: string;
};

export type CatalogQueryInput = {
  page?: number;
  pageSize?: number;
  category?: string;
  theme?: string;
  fit?: string;
  audienceFit?: string;
  q?: string;
};

export type CatalogPage = {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  orderableOnPage: number;
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const bySize = (a: string, b: string) =>
  (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b);

function editorialFor(slug: string): Pick<
  DemoProduct,
  "media" | "verseReference" | "sourceUrl" | "designExplanation" | "fabricTarget" | "line" | "collection" | "fit"
> | undefined {
  return sampleConcepts.find((x) => x.slug === slug);
}

export function fromSample(d: DemoProduct): CatalogProduct {
  return {
    slug: d.slug,
    name: d.name,
    collection: d.collection,
    category: d.category,
    line: d.line,
    palette: d.palette,
    fit: d.fit,
    sizes: d.sizes,
    priceInr: d.priceInr,
    status: "CONCEPT",
    orderable: false,
    source: "sample",
    variants: [],
    media: d.media,
    verseReference: d.verseReference,
    sourceUrl: d.sourceUrl,
    designExplanation: d.designExplanation,
    fabricTarget: d.fabricTarget,
  };
}

type DbRow = Prisma.ProductGetPayload<{include: {variants: true}}>;
export function fromDb(r: DbRow, media?: ConceptMedia[]): CatalogProduct {
  const orderable = r.status === "PREORDER" && r.variants.some((v) => v.enabled);
  const shown = orderable ? r.variants.filter((v) => v.enabled) : r.variants;
  const paise = shown.map((v) => v.pricePaise).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const ed = editorialFor(r.slug);
  return {
    slug: r.slug,
    name: r.title,
    collection: r.collection ?? ed?.collection ?? "",
    category: r.category,
    line: r.tagline ?? ed?.line ?? r.title,
    palette: r.palette ?? "charcoal",
    fit: r.variants[0]?.fit ?? ed?.fit ?? "",
    status: r.status,
    orderable,
    source: "db",
    theme: r.theme ?? undefined,
    language: r.language ?? undefined,
    audienceFit: r.audienceFit,
    disclosure: r.disclosure ?? undefined,
    sizes: [...new Set(shown.map((v) => v.size))].sort(bySize),
    priceInr: paise.length ? Number(paise[0]) / 100 : null,
    variants: r.variants.map((v) => ({
      sku: v.sku,
      size: v.size,
      pricePaise: v.pricePaise.toString(),
      enabled: v.enabled,
    })),
    media: media?.length ? media : ed?.media,
    verseReference: ed?.verseReference,
    sourceUrl: ed?.sourceUrl,
    designExplanation: ed?.designExplanation ?? r.description ?? undefined,
    fabricTarget: ed?.fabricTarget,
  };
}

function mergeEditorialSamples(items: CatalogProduct[]): CatalogProduct[] {
  const bySlug = new Map(items.map((p) => [p.slug, p]));
  for (const sample of sampleConcepts) {
    if (!bySlug.has(sample.slug)) bySlug.set(sample.slug, fromSample(sample));
  }
  return [...bySlug.values()];
}

function catalogWhere(input: CatalogQueryInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {status: {not: "ARCHIVED"}};
  if (input.category === "tees" || input.category === "pants") where.category = input.category;
  if (input.theme?.trim()) where.theme = input.theme.trim().toUpperCase();
  if (input.audienceFit?.trim()) where.audienceFit = input.audienceFit.trim();
  if (input.fit?.trim()) where.variants = {some: {fit: {contains: input.fit.trim(), mode: "insensitive"}}};
  const q = input.q?.trim();
  if (q) {
    where.OR = [
      {title: {contains: q, mode: "insensitive"}},
      {tagline: {contains: q, mode: "insensitive"}},
      {slug: {contains: q.toLowerCase(), mode: "insensitive"}},
      {theme: {contains: q.toUpperCase(), mode: "insensitive"}},
    ];
  }
  return where;
}

/** Paginated storefront query — never loads the full 1,000-record catalog in one request. */
export async function queryCatalogPage(input: CatalogQueryInput = {}): Promise<CatalogPage | null> {
  if (!process.env.DATABASE_URL) return null;
  const pageSize = Math.min(36, Math.max(1, input.pageSize ?? 30));
  const page = Math.max(1, input.page ?? 1);
  try {
    const {prisma} = await import("./db");
    const where = catalogWhere(input);
    const [total, rows] = await withTimeout(
      Promise.all([
        prisma.product.count({where}),
        prisma.product.findMany({
          where,
          include: {variants: {orderBy: {sku: "asc"}}},
          orderBy: [{createdAt: "desc"}, {slug: "asc"}],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]),
      4000,
    );
    const items = rows.map((r) => fromDb(r));
    return {items, total, page, pageSize, orderableOnPage: items.filter((p) => p.orderable).length};
  } catch {
    return null;
  }
}

export async function getOrderableProducts(): Promise<CatalogProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const {prisma} = await import("./db");
    const rows = await withTimeout(
      prisma.product.findMany({
        where: {status: "PREORDER", variants: {some: {enabled: true}}},
        include: {variants: {where: {enabled: true}, orderBy: {sku: "asc"}}},
        orderBy: {title: "asc"},
      }),
      3000,
    );
    return rows.map((r) => fromDb(r));
  } catch {
    return [];
  }
}

/**
 * Lightweight legacy list for checkout/cart/home. Uses pagination when the DB catalog is large.
 */
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!process.env.DATABASE_URL) return sampleConcepts.map(fromSample);
  try {
    const {prisma} = await import("./db");
    const total = await withTimeout(prisma.product.count({where: {status: {not: "ARCHIVED"}}}), 2000);
    if (!total) return sampleConcepts.map(fromSample);
    if (total > 60) {
      const page = await queryCatalogPage({pageSize: 36, page: 1});
      const core = page?.items ?? [];
      return mergeEditorialSamples(core);
    }
    const rows = await withTimeout(
      prisma.product.findMany({
        where: {status: {not: "ARCHIVED"}},
        include: {variants: {orderBy: {sku: "asc"}}},
        orderBy: [{createdAt: "asc"}, {slug: "asc"}],
        take: 200,
      }),
      4000,
    );
    return mergeEditorialSamples(rows.map((r) => fromDb(r)));
  } catch {
    return sampleConcepts.map(fromSample);
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const sample = sampleConcepts.find((x) => x.slug === slug);
  if (!process.env.DATABASE_URL) return sample ? fromSample(sample) : null;
  try {
    const {prisma} = await import("./db");
    const {loadProductMedia} = await import("./catalog-media");
    const row = await withTimeout(
      prisma.product.findFirst({
        where: {slug, status: {not: "ARCHIVED"}},
        include: {variants: {orderBy: {sku: "asc"}}},
      }),
      3000,
    );
    if (!row) return sample ? fromSample(sample) : null;
    const media = await loadProductMedia(row.id, slug);
    return fromDb(row, media);
  } catch {
    return sample ? fromSample(sample) : null;
  }
}

/** Saleability gate: never allow payment without PREORDER + enabled variant + platform checkout flag. */
export function isSaleable(product: CatalogProduct, checkoutFlag: boolean): boolean {
  return Boolean(checkoutFlag && product.orderable && product.status === "PREORDER");
}
