import {disconnectDb} from "../src/lib/db-lifecycle";
import {prisma} from "../src/lib/db";

async function main() {
  const conceptIds = (
    await prisma.product.findMany({where: {designBriefFingerprint: {not: null}}, select: {id: true, slug: true}})
  ).map((p) => p.id);

  const onModel = await prisma.productMediaV2.findMany({
    where: {
      productId: {in: conceptIds},
      visualKind: {in: ["ON_MODEL_CPU_COMPOSITE", "ON_MODEL_RASTER", "ON_MODEL_VTON_FREE"]},
      storefrontVisible: true,
    },
    select: {productId: true, mediaRole: true, contentSha256: true, fileUrl: true},
  });

  const frontByProduct = new Set(
    onModel.filter((m) => m.mediaRole === "FRONT").map((m) => m.productId),
  );
  const backByProduct = new Set(onModel.filter((m) => m.mediaRole === "BACK").map((m) => m.productId));
  const urls = new Set(onModel.map((m) => m.fileUrl));
  const hashes = new Set(onModel.map((m) => m.contentSha256).filter(Boolean));

  const products = await prisma.product.findMany({
    where: {id: {in: conceptIds}},
    select: {conceptMeta: true},
  });
  const modelIds = products
    .map((p) => (p.conceptMeta as {onModelGeneration?: {modelIdentityId?: string}} | null)?.onModelGeneration?.modelIdentityId)
    .filter(Boolean) as string[];

  const report = {
    conceptProducts: conceptIds.length,
    skusWithOnModelFront: frontByProduct.size,
    skusWithOnModelBack: backByProduct.size,
    skusStillNeedingRender: conceptIds.length - frontByProduct.size,
    distinctOnModelUrls: urls.size,
    distinctContentSha256: hashes.size,
    uniqueModelIdentities: new Set(modelIds).size,
    pass: frontByProduct.size > 0,
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