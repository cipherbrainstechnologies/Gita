/**
 * Reports distinct file URLs and content hashes for concept catalogue media.
 */
import {disconnectDb} from "../src/lib/db-lifecycle";
import {prisma} from "../src/lib/db";
import {isSharedTemplateUrl} from "../src/lib/fashion/template-urls";

async function main() {
  const conceptProducts = await prisma.product.findMany({
    where: {designBriefFingerprint: {not: null}},
    select: {id: true},
  });
  const conceptIds = conceptProducts.map((p) => p.id);

  const media = await prisma.productMediaV2.findMany({
    where: {productId: {in: conceptIds}},
    select: {
      fileUrl: true,
      contentSha256: true,
      approvedForPublication: true,
      storefrontVisible: true,
      visualKind: true,
      mediaRole: true,
      productId: true,
    },
  });

  const fileUrls = new Set<string>();
  const contentHashes = new Set<string>();
  let sharedApproved = 0;
  let storefrontRows = 0;
  let fronts = 0;
  let backs = 0;

  const urlToProducts = new Map<string, Set<string>>();

  for (const m of media) {
    fileUrls.add(m.fileUrl);
    if (m.contentSha256) contentHashes.add(m.contentSha256);
    if (m.storefrontVisible) storefrontRows++;
    if (m.mediaRole === "FRONT" && (m.storefrontVisible || m.approvedForPublication)) fronts++;
    if (m.mediaRole === "BACK" && (m.storefrontVisible || m.approvedForPublication)) backs++;
    if (isSharedTemplateUrl(m.fileUrl) && m.approvedForPublication) sharedApproved++;

    const set = urlToProducts.get(m.fileUrl) ?? new Set();
    set.add(m.productId);
    urlToProducts.set(m.fileUrl, set);
  }

  const topShared = [...urlToProducts.entries()]
    .filter(([, ids]) => ids.size > 1)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 10)
    .map(([url, ids]) => ({url, productCount: ids.size}));

  const report = {
    conceptProducts: conceptIds.length,
    mediaRows: media.length,
    distinctFileUrls: fileUrls.size,
    distinctContentSha256: contentHashes.size,
    storefrontVisibleRows: storefrontRows,
    storefrontFrontViews: fronts,
    storefrontBackViews: backs,
    sharedTemplatesStillApproved: sharedApproved,
    topRepeatedUrls: topShared,
    pass: sharedApproved === 0 && fileUrls.size >= Math.min(conceptIds.length, 500),
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());