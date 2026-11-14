import {NextResponse} from "next/server";
import {auth} from "@/auth";
export async function GET(){const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Authentication required"},{status:401});return NextResponse.json({orders:[],stage:"preview",notice:"No order collection in preview"})}
