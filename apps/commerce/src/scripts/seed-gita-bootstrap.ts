import type {ExecArgs} from "@medusajs/framework/types";
import {ContainerRegistrationKeys, Modules} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  createStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Idempotent Gita staging bootstrap: store, default sales channel, publishable API key.
 * Logs the publishable key token once when created (set MEDUSA_PUBLISHABLE_KEY on web).
 */
export default async function seedGitaBootstrap({container}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModule = container.resolve(Modules.STORE);
  const apiKeyModule = container.resolve(Modules.API_KEY);

  const existingKeys = await apiKeyModule.listApiKeys({type: "publishable"}, {take: 1});
  if (existingKeys.length) {
    logger.info("Publishable API key already exists — skipping bootstrap");
    return;
  }

  const stores = await storeModule.listStores();
  if (!stores.length) {
    await createStoresWorkflow(container).run({
      input: {stores: [{name: "VERSE//MODE", supported_currencies: [{currency_code: "inr", is_default: true}]}]},
    });
  }

  const {
    result: [salesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [{name: "VERSE//MODE Web", description: "Gita Next.js storefront"}],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [{title: "Gita Storefront Publishable", type: "publishable", created_by: "bootstrap"}],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {id: publishableApiKey.id, add: [salesChannel.id]},
  });

  const revealed = await apiKeyModule.retrieveApiKey(publishableApiKey.id, {select: ["token"]});
  logger.info(
    `Created publishable API key. Set MEDUSA_PUBLISHABLE_KEY on apps/web (token prefix ${String(revealed.token).slice(0, 12)}…)`,
  );
}