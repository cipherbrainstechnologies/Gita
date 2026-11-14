const TONES: Record<string, string> = {
  CONCEPT: "#e7e5df", SAMPLE_PENDING: "#eadfb8", SAMPLE_APPROVED: "#d5e3b0", PREORDER: "#c6f268", CLOSED: "#d9d2cf", ARCHIVED: "#cfcfcf",
  PAID: "#d5e3b0", VENDOR_CONFIRMED: "#d5e3b0", IN_PRODUCTION: "#eadfb8", QUALITY_CONTROL: "#eadfb8", READY_TO_DISPATCH: "#c6f268", SHIPPED: "#c6f268", DELIVERED: "#c6f268",
  PAYMENT_PENDING: "#e7e5df", DRAFT: "#e7e5df", CANCEL_REQUESTED: "#f0cfc6", CANCELLED: "#d9d2cf", REFUND_PENDING: "#f0cfc6", REFUNDED: "#d9d2cf", EXCEPTION: "#f0b9aa",
  QUEUED: "#e7e5df", RUNNING: "#eadfb8", COMPLETED: "#d5e3b0", FAILED: "#f0b9aa", NEEDS_CONFIGURATION: "#f0cfc6",
  OK: "#d5e3b0", WARN: "#eadfb8", BAD: "#f0b9aa"
};
const SUFFIX: Record<string, string> = {CONCEPT: "NOT ORDERABLE", PREORDER: "OPEN FOR PREORDER"};

/** Static (non-overlay) status pill. CONCEPT and PREORDER carry an explicit suffix so staff cannot confuse them. */
export function StatusChip({status, label}: {status: string; label?: string}) {
  const text = label ?? status.replace(/_/g, " ") + (SUFFIX[status] ? ` · ${SUFFIX[status]}` : "");
  return <span className="chip admin-chip" data-status={status} style={{background: TONES[status] ?? "#e7e5df"}}>{text}</span>;
}

