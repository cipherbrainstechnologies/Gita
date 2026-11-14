import {NextRequest,NextResponse} from "next/server";
import {sampleConcepts} from "@/lib/catalog";
export async function GET(req:NextRequest){const c=req.nextUrl.searchParams.get('category');return NextResponse.json({stage:'concept-preview',orderable:false,products:sampleConcepts.filter(x=>!c||x.category===c)},{headers:{"Cache-Control":"no-store"}})}
