const {loadEnv, defineConfig} = require("@medusajs/framework/utils");

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const storeCors =
  process.env.STORE_CORS ??
  "http://localhost:3000,https://web-production-b2b81db7.up.railway.app";
const adminCors = process.env.ADMIN_CORS ?? "http://localhost:7001,http://localhost:9000";
const authCors = process.env.AUTH_CORS ?? adminCors;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors,
      adminCors,
      authCors,
      jwtSecret: process.env.JWT_SECRET || "change-me-jwt",
      cookieSecret: process.env.COOKIE_SECRET || "change-me-cookie",
    },
  },
  modules: [
    {
      resolve: "./src/modules/gita-bridge",
    },
  ],
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
});