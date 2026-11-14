import {auth} from "@/auth";
import Link from "next/link";
export default async function Orders(){const session=await auth();return <div className="page-wrap"><p className="kicker dark">ACCOUNT / ORDERS</p><h1 className="page-title">Your orders<span>.</span></h1>{session?.user?<p>This site is currently in concept-preview mode. No real orders can be placed. When operational, verified order data and preorder-stage timelines will appear here.</p>:<p>To view verified orders when purchasing opens, <Link className="text-link" href="/login">sign in with Google</Link>.</p>}</div>}
