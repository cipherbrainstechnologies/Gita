/**
 * Single entry for Railway web + worker services sharing the same image.
 * Routes by RAILWAY_SERVICE_NAME so Config-as-Code can use one startCommand.
 */
import {spawn} from 'node:child_process';

const name = (process.env.RAILWAY_SERVICE_NAME || process.env.SERVICE_ROLE || 'web').toLowerCase();
const isWorker = name.includes('worker');

const command = isWorker
  ? 'npm run worker'
  : 'npx prisma migrate deploy && npm run start';

console.log(`[railway-entry] service=${name} mode=${isWorker ? 'worker' : 'web'}`);

const child = spawn(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
