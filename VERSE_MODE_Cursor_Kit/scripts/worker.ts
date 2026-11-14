/**
 * Draft assembly worker. It does NOT invoke a paid or unlicensed image model.
 * A production creative provider adapter must be implemented before claiming AI artwork.
 */
import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import {prisma} from '../src/lib/db';
import {designFingerprint} from '../src/lib/dedupe';
if(!process.env.REDIS_URL)throw new Error('worker requires REDIS_URL');
const connection=new IORedis(process.env.REDIS_URL,{maxRetriesPerRequest:null});
const worker=new Worker('verse-studio',async job=>{
 const {runId}=job.data as {runId:string};
 const run=await prisma.jobRun.findUnique({where:{id:runId}});
 if(!run)return;
 if(run.status==='COMPLETED')return;
 const payload=run.payload as {batchSize?:number,theme?:string,garment?:string};
 const limit=Math.max(1,Math.min(100,Number(payload.batchSize||20)));
 await prisma.jobRun.update({where:{id:runId},data:{status:'RUNNING'}});
 try{
  const drafts=await prisma.designBrief.findMany({where:{state:'DRAFT'},orderBy:{id:'asc'},take:limit*3});
  let count=0;
  for(const draft of drafts){
   if(count>=limit)break;
   const candidateId=designFingerprint(draft.quoteFingerprint,draft.garmentFamily,draft.artFamily);
   await prisma.designCandidate.upsert({where:{fingerprint:candidateId},create:{fingerprint:candidateId,quoteText:draft.quoteText,theme:payload.theme||draft.theme,garmentFamily:draft.garmentFamily,artFamily:draft.artFamily,state:'NEEDS_HUMAN_REVIEW',designBriefId:draft.id},update:{}});
   await prisma.designBrief.update({where:{id:draft.id},data:{state:'ASSEMBLED'}});
   count++;
   await prisma.jobRun.update({where:{id:runId},data:{processed:count}});
  }
  await prisma.jobRun.update({where:{id:runId},data:{status:'COMPLETED',completedAt:new Date(),processed:count}});
  return {assembled:count,notice:'Drafts assembled, AI images not generated'};
 }catch(e){await prisma.jobRun.update({where:{id:runId},data:{status:'FAILED',error:e instanceof Error?e.message.slice(0,500):'Unknown error'}});throw e}
},{connection,concurrency:2});
worker.on('failed',(job,err)=>console.error('job failure',job?.id,err.message));
const shutdown=async()=>{await worker.close();await connection.quit();await prisma.$disconnect()};
process.on('SIGINT',()=>{void shutdown()});process.on('SIGTERM',()=>{void shutdown()});
console.log('Verse Mode draft-assembly worker ready; no generative rendering configured');
