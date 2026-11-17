import {model} from "@medusajs/framework/utils";

const CreativePublicationGate = model.define("gita_creative_publication_gate", {
  id: model.id().primaryKey(),
  gita_slug: model.text().searchable(),
  gita_design_id: model.text().nullable(),
  medusa_product_id: model.text().nullable(),
  publication_state: model
    .enum(["concept", "draft", "approved", "preorder", "stocked", "closed"])
    .default("concept"),
  rights_approved: model.boolean().default(false),
  manufacturing_approved: model.boolean().default(false),
  media_approved: model.boolean().default(false),
  notes: model.text().nullable(),
});

export default CreativePublicationGate;