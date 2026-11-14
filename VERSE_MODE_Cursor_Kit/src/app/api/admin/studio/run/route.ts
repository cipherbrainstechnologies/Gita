import {NextResponse} from "next/server";
import {z} from 'zod';
import {canAdmin} from '@/lib/admin';
import {prisma} from '@/lib/db';
import {studioQueue} from '@/lib/queue';
const schema=z.object({batchSize:z.number().int().min(1).max(100).default(20),theme:z.string().min(2).max(80),garment:z.enum(['TEES','PANTS','MIXED']).default('MIXED'),requestId:z.string().uuid()});
export async function POST(request:Request){
 if(!await canAdmin(['SUPERADMIN','DESIGNER','MERCHANDISER']))return NextResponse.json({error:'Forbidden'},{status:403});
 let data;try{data=schema.parse(await request.json())}catch{return NextResponse.json({error:'Invalid job request'},{status:400})}
 try{
  const run=await prisma.jobRun.upsert({where:{idempotencyKey:data.requestId},create:{idempotencyKey:data.requestId,kind:'STUDIO_ASSEMBLY',status:'QUEUED',payload:data,total:data.batchSize},update:{}});
  await studioQueue().add('assemble-draft-concepts',{runId:run.id},{jobId:run.id,attempts:3,backoff:{type:'exponential',delay:1000},removeOnComplete:500});
  return NextResponse.json({jobId:run.id,state:'QUEUED',message:'Draft concept assembly queued. External AI rendering requires separate provider configuration.'},{status:202});
 }catch{return NextResponse.json({error:'Queue or database unavailable. No work claimed.'},{status:503})}
}
