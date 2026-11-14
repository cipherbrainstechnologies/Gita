import {redirect} from "next/navigation";
import {auth} from "@/auth";

/** Server-side gate for customer pages: redirects to /login (preserving the destination) when there is no session email. */
export async function requireCustomer(returnTo: string): Promise<{email: string; name: string | null}> {
  const s = await auth();
  const email = s?.user?.email?.trim().toLowerCase();
  if (!email) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return {email, name: s?.user?.name ?? null};
}
