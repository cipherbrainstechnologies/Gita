/** Alias entrypoint for offline zero-paid catalog rendering. */
import {execSync} from "node:child_process";

const args = process.argv.slice(2).join(" ");
execSync(`npx tsx scripts/batch-on-model-render.ts ${args}`, {stdio: "inherit", cwd: process.cwd()});