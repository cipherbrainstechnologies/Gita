import type {MedusaRequest, MedusaResponse} from "@medusajs/framework/http";
import type GitaBridgeModuleService from "../../../../modules/gita-bridge/service";
import {GITA_BRIDGE_MODULE} from "../../../../modules/gita-bridge";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bridge = req.scope.resolve<GitaBridgeModuleService>(GITA_BRIDGE_MODULE);
  const [maps, gates] = await Promise.all([
    bridge.listExternalResourceMaps({}, {take: 5, order: {created_at: "DESC"}}),
    bridge.listCreativePublicationGates({}, {take: 5, order: {created_at: "DESC"}}),
  ]);
  res.json({
    externalMapsSampleCount: maps.length,
    publicationGatesSampleCount: gates.length,
    commerceSystem: "medusa",
    at: new Date().toISOString(),
  });
}