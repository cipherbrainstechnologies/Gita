/**
 * Public legal-entity details from env. Every field falls back to an explicit placeholder: nothing is invented.
 *   LEGAL_SELLER_NAME / _GSTIN / _ADDRESS            (same vars checkout snapshots onto orders)
 *   LEGAL_SELLER_SUPPORT_EMAIL / _SUPPORT_PHONE / _SUPPORT_HOURS
 *   LEGAL_SELLER_GRIEVANCE_OFFICER / _GRIEVANCE_EMAIL / _GRIEVANCE_PHONE
 */
export type LegalField = {label: string; value: string; set: boolean};
const PENDING = "[Pending — to be provided after legal entity registration]";
const f = (label: string, v: string | undefined): LegalField => ({label, value: v?.trim() || PENDING, set: Boolean(v?.trim())});

export function legalEntity() {
  const e = process.env;
  const entity = [f("Legal seller name", e.LEGAL_SELLER_NAME), f("GSTIN", e.LEGAL_SELLER_GSTIN), f("Registered address", e.LEGAL_SELLER_ADDRESS)];
  const support = [f("Support email", e.LEGAL_SELLER_SUPPORT_EMAIL), f("Support phone", e.LEGAL_SELLER_SUPPORT_PHONE), f("Support hours", e.LEGAL_SELLER_SUPPORT_HOURS)];
  const grievance = [f("Grievance officer", e.LEGAL_SELLER_GRIEVANCE_OFFICER), f("Grievance email", e.LEGAL_SELLER_GRIEVANCE_EMAIL), f("Grievance phone", e.LEGAL_SELLER_GRIEVANCE_PHONE)];
  return {entity, support, grievance, complete: [...entity, ...support, ...grievance].every(x => x.set)};
}
