import type {Metadata} from "next";
import "./globals.css";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import {Providers} from "@/components/Providers";

export const metadata: Metadata = {
  title: "VERSE//MODE | Wear your state of mind",
  description:
    "Preview concept for an AI-powered India-first preorder streetwear brand. Products not yet available for purchase.",
};

/**
 * Fonts load at runtime via CSS (see globals.css) so Docker/Railway builds do not depend on
 * next/font Google fetch during `next build` (flaky in headless builders).
 */
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
