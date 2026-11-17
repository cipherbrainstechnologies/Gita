import type {ExecArgs} from "@medusajs/framework/types";
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils";

/**
 * Idempotent India INR region + default sales channel for Gita staging.
 * Safe to run multiple times (skips when region exists).
 */
export default async function seedIndiaRegion({container}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const regionModule = container.resolve(Modules.REGION);
  const storeModule = container.resolve(Modules.STORE);

  const existing = await regionModule.listRegions({name: "India"});
  if (existing.length) {
    logger.info("India region already present — skipping seed");
    return;
  }

  const region = await regionModule.createRegions({
    name: "India",
    currency_code: "inr",
    countries: ["in"],
  });

  const [store] = await storeModule.listStores();
  if (store) {
    await storeModule.updateStores(store.id, {
      supported_currencies: [{currency_code: "inr", is_default: true}],
      default_sales_channel_id: store.default_sales_channel_id,
    });
  }

  logger.info(`Seeded India region ${region.id}`);
}