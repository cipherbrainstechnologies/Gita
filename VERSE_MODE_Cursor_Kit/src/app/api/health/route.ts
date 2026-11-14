import {NextResponse} from "next/server";
export async function GET(){return NextResponse.json({status:"ok",service:"verse-mode-web",stage:"preview",checkoutEnabled:false,at:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}
