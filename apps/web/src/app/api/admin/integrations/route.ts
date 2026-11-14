import {NextResponse} from 'next/server';
import {z} from 'zod';
import {canAdmin,adminRole} from '@/lib/admin';
import {prisma} from '@/lib/db';
import {encryptSecret,maskedSecret} from '@/lib/vault';
const providers=['RAZORPAY','SHIPROCKET','WHATSAPP','SMS','EMAIL','AI_RENDER'] as const;
const schema=z.object({provider:z.enum(providers),secret:z.string().min(8).max(8192),mode:z.enum(['SANDBOX','LIVE']).default('SANDBOX')});
export async function GET(){if(!await canAdmin(['SUPERADMIN']))return NextResponse.json({error:'Forbidden'},{status:403});try{const rows=await prisma.integrationSetting.findMany({select:{provider:true,mode:true,maskedSuffix:true,updatedAt:true}});return NextResponse.json({integrations:rows})}catch{return NextResponse.json({error:'DB not configured'},{status:503})}}
export async function POST(req:Request){if(!await canAdmin(['SUPERADMIN']))return NextResponse.json({error:'Forbidden'},{status:403});
 let data;try{data=schema.parse(await req.json())}catch{return NextResponse.json({error:'Invalid integration configuration'},{status:400})}
 try{const enc=encryptSecret(data.secret,data.provider);await prisma.$transaction(async tx=>{
  await tx.integrationSetting.upsert({where:{provider:data.provider},create:{provider:data.provider,mode:data.mode,maskedSuffix:maskedSecret(data.secret),encryptedPayload:enc.payload,nonce:enc.nonce,authTag:enc.authTag,keyVersion:enc.keyVersion},update:{mode:data.mode,maskedSuffix:maskedSecret(data.secret),encryptedPayload:enc.payload,nonce:enc.nonce,authTag:enc.authTag,keyVersion:enc.keyVersion}});
  await tx.auditLog.create({data:{actor:await adminRole()??'SUPERADMIN',action:'INTEGRATION_CONFIG_CHANGED',target:data.provider,details:{credential:'masked',mode:data.mode}}});
 });return NextResponse.json({provider:data.provider,configured:true,masked:maskedSecret(data.secret),mode:data.mode})}
 catch{return NextResponse.json({error:'Cannot securely save. Verify key and DB availability.'},{status:503})}
}
