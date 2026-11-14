import {prisma} from "./db";

/** Graceful shutdown for long-running scripts — reduces Postgres "connection reset by peer" noise. */
export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}

export function installScriptDbShutdown(): void {
  const close = () => {
    void disconnectDb().finally(() => process.exit(process.exitCode ?? 0));
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

/** Chunk an array for batched DB work. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function pause(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}