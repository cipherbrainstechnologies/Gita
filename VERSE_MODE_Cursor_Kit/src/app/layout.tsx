import type {Metadata} from "next";
import "./globals.css";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
export const metadata: Metadata = {title:"VERSE//MODE | Wear your state of mind",description:"Preview concept for an AI-powered India-first preorder streetwear brand. Products not yet available for purchase."};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
