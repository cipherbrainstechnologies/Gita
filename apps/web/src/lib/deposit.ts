import type {DepositPolicy} from "@prisma/client";

export type DepositBreakdown = {
  fullTotalPaise: bigint;
  depositDuePaise: bigint;
  balanceDuePaise: bigint;
  chargeNowPaise: bigint;
  usingDeposit: boolean;
};

/** Integer-paise deposit math. Never charges more than full price or below Razorpay practical minimum (100 paise). */
export function calculateDepositBreakdown(
  fullTotalPaise: bigint,
  policy: Pick<DepositPolicy, "enabled" | "flatDepositPaise" | "maxDepositPercentBps" | "pauseDepositCheckout"> | null,
  opts?: {depositCheckoutEnabled?: boolean},
): DepositBreakdown {
  const full = fullTotalPaise > 0n ? fullTotalPaise : 0n;
  const gate = Boolean(opts?.depositCheckoutEnabled && policy?.enabled && !policy.pauseDepositCheckout);
  if (!gate || full === 0n) {
    return {fullTotalPaise: full, depositDuePaise: full, balanceDuePaise: 0n, chargeNowPaise: full, usingDeposit: false};
  }
  const cap = (full * BigInt(policy!.maxDepositPercentBps)) / 10000n;
  let deposit = policy!.flatDepositPaise;
  if (deposit > cap) deposit = cap;
  if (deposit > full) deposit = full;
  if (deposit < 100n) deposit = 100n;
  const balance = full > deposit ? full - deposit : 0n;
  return {
    fullTotalPaise: full,
    depositDuePaise: deposit,
    balanceDuePaise: balance,
    chargeNowPaise: deposit,
    usingDeposit: deposit < full,
  };
}

export function formatInrPaise(paise: bigint): string {
  return `₹${(Number(paise) / 100).toLocaleString("en-IN", {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
}