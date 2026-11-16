/**
 * Railway entry for medusa-api vs medusa-worker (shared image, root apps/commerce).
 */
import {spawn} from "node:child_process";

const name = (process.env.RAILWAY_SERVICE_NAME || "medusa-api").toLowerCase();
const isWorker = name.includes("worker");
process.env.MEDUSA_WORKER_MODE = isWorker ? "worker" : "server";
if (isWorker) process.env.DISABLE_MEDUSA_ADMIN = "true";

const command = isWorker
  ? "npx medusa start"
  : "npx medusa db:migrate && npx medusa start";

console.log(
  `[gita-commerce-entry] service=${name} MEDUSA_WORKER_MODE=${process.env.MEDUSA_WORKER_MODE}`,
);

const child = spawn(command, {stdio: "inherit", shell: true, env: process.env});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});