/**
 * Railway entry for medusa-api vs medusa-worker (shared image, root apps/commerce).
 */
import {spawn} from "node:child_process";

const name = (process.env.RAILWAY_SERVICE_NAME || "medusa-api").toLowerCase();
const isWorker = name.includes("worker");
process.env.MEDUSA_WORKER_MODE = isWorker ? "worker" : "server";
if (isWorker) process.env.DISABLE_MEDUSA_ADMIN = "true";

const start =
  "cd .medusa/server && (npx medusa db:migrate || true) && npm run start";
const bootstrap =
  "npx medusa exec ./src/scripts/seed-india-region.ts && npx medusa exec ./src/scripts/seed-gita-bootstrap.ts";
const command = isWorker
  ? "cd .medusa/server && npm run start"
  : `npx medusa db:migrate && ${bootstrap} && ${start}`;

console.log(
  `[gita-commerce-entry] service=${name} MEDUSA_WORKER_MODE=${process.env.MEDUSA_WORKER_MODE}`,
);

const child = spawn(command, {stdio: "inherit", shell: true, env: process.env});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});