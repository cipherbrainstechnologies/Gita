/** Formats integer paise (string | bigint) as INR without floating point. */
export function formatPaise(paise: string | bigint): string {
  const v = typeof paise === "bigint" ? paise : BigInt(paise);
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const rupees = (abs / 100n).toString().replace(/\B(?=(\d{2})*\d{3}(?!\d))/g, ",");
  const frac = (abs % 100n).toString().padStart(2, "0");
  return `${neg ? "-" : ""}₹${rupees}.${frac}`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata"});
}
