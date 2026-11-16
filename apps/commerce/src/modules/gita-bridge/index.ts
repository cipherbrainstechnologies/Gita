import GitaBridgeModuleService from "./service";
import {Module} from "@medusajs/framework/utils";

export const GITA_BRIDGE_MODULE = "gitaBridge";

export default Module(GITA_BRIDGE_MODULE, {
  service: GitaBridgeModuleService,
});