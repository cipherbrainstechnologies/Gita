import type {ExecArgs} from "@medusajs/framework/types";
import {ContainerRegistrationKeys} from "@medusajs/framework/utils";
import type GitaBridgeModuleService from "../modules/gita-bridge/service";
import {GITA_BRIDGE_MODULE} from "../modules/gita-bridge";

type ImportRow = {
  sourceId: string;
  gitaSlug: string;
  title: string;
  medusaProductId?: string;
  publicationState?: "concept" | "draft" | "approved" | "preorder" | "closed";
};

/**
 * Dry-run catalog shadow import entrypoint.
 * Full Prisma → Medusa product upsert lives in apps/web/scripts (source of Gita design records).
 * Pass GITA_CATALOG_IMPORT_JSON='[{...}]' for controlled staging imports.
 */
export default async function gitaCatalogImport({container}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const bridge = container.resolve<GitaBridgeModuleService>(GITA_BRIDGE_MODULE);
  const dryRun = process.env.GITA_IMPORT_DRY_RUN !== "false";
  const raw = process.env.GITA_CATALOG_IMPORT_JSON?.trim();

  if (!raw) {
    logger.info("No GITA_CATALOG_IMPORT_JSON — nothing to import (dry-run idle)");
    return;
  }

  const rows = JSON.parse(raw) as ImportRow[];
  let created = 0;
  for (const row of rows) {
    const existing = await bridge.listExternalResourceMaps({
      source_system: "GITA",
      source_table: "Product",
      source_id: row.sourceId,
    });
    if (existing.length) continue;
    if (dryRun) {
      created++;
      continue;
    }
    await bridge.createExternalResourceMaps({
      source_system: "GITA",
      source_table: "Product",
      source_id: row.sourceId,
      medusa_entity: "product",
      medusa_id: row.medusaProductId ?? `pending_${row.gitaSlug}`,
      migration_version: "shadow-v1",
    });
    await bridge.createCreativePublicationGates({
      gita_slug: row.gitaSlug,
      publication_state: row.publicationState ?? "concept",
      rights_approved: false,
      manufacturing_approved: false,
      media_approved: false,
    });
    created++;
  }

  logger.info(`Catalog import ${dryRun ? "dry-run" : "apply"}: ${created} new row(s) processed`);
}