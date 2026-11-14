import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
// OAuth secret and client credentials MUST be provided through server environment.
// A Google account grants customer access only; admin authorisation occurs in database on every privileged request.
const googleReady=Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:googleReady?[Google({clientId:process.env.AUTH_GOOGLE_ID!,clientSecret:process.env.AUTH_GOOGLE_SECRET!})]:[],
 trustHost:process.env.NODE_ENV==='production',
 session:{strategy:'jwt'},
 pages:{signIn:'/login'},
 callbacks:{async session({session}){return session}}
});
