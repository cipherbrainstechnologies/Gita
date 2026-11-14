import {NextResponse} from "next/server";
/** Fail closed: do not accidentally collect money from conceptual sample catalog. */
export async function POST(){return NextResponse.json({error:{code:"CHECKOUT_NOT_LIVE",message:"Product and supplier approval, legal checkout policy, sandbox provider testing and payment integration are required before preorders can open."}},{status:503})}
