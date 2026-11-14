import type {Metadata} from "next";
import {DM_Sans, Space_Grotesk} from "next/font/google";
import "./globals.css";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
const display=Space_Grotesk({subsets:["latin"],weight:["500","700"],variable:"--font-display",display:"swap"});
const body=DM_Sans({subsets:["latin"],variable:"--font-body",display:"swap"});
export const metadata: Metadata = {title:"VERSE//MODE | Wear your state of mind",description:"Preview concept for an AI-powered India-first preorder streetwear brand. Products not yet available for purchase."};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>){return <html lang="en" className={`${display.variable} ${body.variable}`}><body><Header/><main>{children}</main><Footer/></body></html>}

