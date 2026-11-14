import {signIn} from "@/auth";
import {DemoBanner} from "@/components/DemoBanner";
import {LoginForm} from "@/components/LoginForm";
import {demoAccounts, demoUiEnabled, safeRedirect} from "@/lib/demo";

export const dynamic = "force-dynamic";
export default async function Login({searchParams}: {searchParams: Promise<{callbackUrl?: string}>}) {
  const redirectTo = safeRedirect((await searchParams).callbackUrl);
  const google = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);
  const demo = demoUiEnabled();
  return <div className="page-wrap login-card">
    <p className="kicker dark">ACCOUNT</p>
    <h1 className="page-title">Your corner<span>.</span></h1>
    <DemoBanner showCredentials />
    <p>Sign in to see your orders, waitlist and preorder history. Only approved internal accounts can access the administration panel.</p>
    {google && <form action={async () => { "use server"; await signIn("google", {redirectTo}); }}><button className="primary-cta button" type="submit">CONTINUE WITH GOOGLE ↗</button></form>}
    {demo && <section aria-labelledby="demo-signin"><h2 id="demo-signin" className="sub-title">Demo sign-in</h2><LoginForm redirectTo={redirectTo} hints={demoAccounts()} /></section>}
    {!google && !demo && <p className="notice">Google OAuth is not configured in this preview. Configure official credentials in the Railway environment.</p>}
  </div>;
}
