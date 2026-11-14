"use client";
import {SessionProvider} from "next-auth/react";

/** Client session bridge for next-auth/react (demo LoginForm). */
export function Providers({children}: {children: React.ReactNode}) {
  return <SessionProvider>{children}</SessionProvider>;
}
