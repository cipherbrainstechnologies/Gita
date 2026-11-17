import {model} from "@medusajs/framework/utils";

const ExternalResourceMap = model.define("gita_external_resource_map", {
  id: model.id().primaryKey(),
  source_system: model.text().default("GITA"),
  source_table: model.text(),
  source_id: model.text(),
  medusa_entity: model.text(),
  medusa_id: model.text(),
  checksum: model.text().nullable(),
  migration_version: model.text().nullable(),
  last_reconciled_at: model.dateTime().nullable(),
});

export default ExternalResourceMap;