import type {MedusaContainer} from "@medusajs/framework";

/**
 * Gita uses seed-gita-bootstrap + seed-india-region instead of Medusa demo catalog.
 * This migration hook is intentionally a no-op to avoid EU demo region conflicts.
 */
export default async function initial_data_seed(_container: MedusaContainer) {
  return;
}