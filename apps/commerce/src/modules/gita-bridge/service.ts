import {MedusaService} from "@medusajs/framework/utils";
import ExternalResourceMap from "./models/external-resource-map";
import CreativePublicationGate from "./models/creative-publication-gate";

class GitaBridgeModuleService extends MedusaService({
  ExternalResourceMap,
  CreativePublicationGate,
}) {}

export default GitaBridgeModuleService;