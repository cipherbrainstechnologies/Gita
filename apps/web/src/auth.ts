import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "@/lib/db";
import {demoAuthEnabled} from "@/lib/demo";

const googleReady = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const credsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(200),
});

/**
 * Google OIDC for production customers/staff (admin still requires AdminUser row).
 * Credentials provider is DEMO_AUTH-only — never enable in a real revenue environment without a deliberate security review.
 */
export const {handlers, auth, signIn, signOut} = NextAuth({
  providers: [
    ...(googleReady
      ? [Google({clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET!})]
      : []),
    Credentials({
      id: "credentials",
      name: "Demo credentials",
      credentials: {email: {label: "Email", type: "email"}, password: {label: "Password", type: "password"}},
      authorize: async (raw) => {
        if (!demoAuthEnabled()) return null;
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const row = await prisma.demoCredential.findUnique({where: {email: parsed.data.email}});
        if (!row?.active) return null;
        const ok = await bcrypt.compare(parsed.data.password, row.passwordHash);
        if (!ok) return null;
        if (row.kind === "STAFF") {
          const staff = await prisma.adminUser.findUnique({where: {email: row.email}, select: {active: true}});
          if (!staff?.active) return null;
        } else {
          await prisma.customer.upsert({
            where: {email: row.email},
            create: {email: row.email, displayName: row.displayName ?? "Demo Customer", over18ConfirmedAt: new Date()},
            update: {displayName: row.displayName ?? undefined},
          });
        }
        return {id: row.id, email: row.email, name: row.displayName ?? row.email};
      },
    }),
  ],
  trustHost: true,
  session: {strategy: "jwt"},
  pages: {signIn: "/login"},
  callbacks: {
    async session({session, token}) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
