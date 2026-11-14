/**
 * Draft assembly worker. Assembly never depends on a model: after each candidate is assembled the worker optionally asks the
 * graphic provider for motif + flat mockup. REMOTE calls go to an external GPU service only (never inference on this process).
 * Unconfigured provider => labelled SIMULATION_ONLY placeholders + job notice NEEDS_CONFIGURATION; assembly still completes.
 */
import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import {prisma} from '../src/lib/db';
import {designFingerprint} from '../src/lib/dedupe';
import {decryptSecret} from '../src/lib/vault';
import {getDiffusersProvider} from '../src/lib/providers/graphic';
import {createAssetStore} from '../src/lib/providers/graphic/assetStore';
import {enrichCandidate,type BudgetState} from '../src/lib/providers/graphic/candidateAssets';
if(!process.env.REDIS_URL)throw new Error('worker requires REDIS_URL');
const connection=new IORedis(process.env.REDIS_URL,{maxRetriesPerRequest:null});
/** Vault AI_RENDER endpoint (LIVE mode only). Failure to read yields a sentinel so the provider reports INVALID_CONFIG instead of silently trusting nothing. */
async function vaultAiRender():Promise<string|null>{
 try{
  const row=await prisma.integrationSetting.findUnique({where:{provider:'AI_RENDER'}});
  if(!row||row.mode!=='LIVE')return null;
  return decryptSecret({payload:row.encryptedPayload,nonce:row.nonce,authTag:row.authTag},'AI_RENDER');
 }catch{return 'invalid:vault-unreadable'}
}
const worker=new Worker('verse-studio',async job=>{
 const {runId}=job.data as {runId:string};
 const run=await prisma.jobRun.findUnique({where:{id:runId}});
 if(!run)return;
 if(run.status==='COMPLETED')return;
 const payload=run.payload as {batchSize?:number,theme?:string,garment?:string};
 const limit=Math.max(1,Math.min(100,Number(payload.batchSize||20)));
 await prisma.jobRun.update({where:{id:runId},data:{status:'RUNNING'}});
 try{
  const provider=getDiffusersProvider({vaultAiRender:process.env.DIFFUSERS_API_URL?null:await vaultAiRender()});
  const store=createAssetStore(process.env.ASSET_STORAGE_DIR);
  const budgetEnv=Number(process.env.AI_RENDER_BUDGET_INR);
  const budget:BudgetState={spentInr:0,budgetInr:Number.isFinite(budgetEnv)&&budgetEnv>0?budgetEnv:0}; // unset budget => no paid generation
  const ctx={prisma,provider,store,budget,licensedCheckpoint:process.env.AI_RENDER_LICENSED_CHECKPOINT||undefined};
  const tally={created:0,existing:0,busy:0,skipped:0,failed:0};const notices=new Set<string>();const failCodes=new Set<string>();
  const drafts=await prisma.designBrief.findMany({where:{state:'DRAFT'},orderBy:{id:'asc'},take:limit*3});
  let count=0;
  for(const draft of drafts){
   if(count>=limit)break;
   const candidateId=designFingerprint(draft.quoteFingerprint,draft.garmentFamily,draft.artFamily);
   const candidate=await prisma.designCandidate.upsert({where:{fingerprint:candidateId},create:{fingerprint:candidateId,quoteText:draft.quoteText,theme:payload.theme||draft.theme,garmentFamily:draft.garmentFamily,artFamily:draft.artFamily,state:'NEEDS_HUMAN_REVIEW',designBriefId:draft.id},update:{}});
   await prisma.designBrief.update({where:{id:draft.id},data:{state:'ASSEMBLED'}});
   count++;
   await prisma.jobRun.update({where:{id:runId},data:{processed:count}});
   try{ // provider problems must never block or fail assembly
    const r=await enrichCandidate(ctx,{candidateId:candidate.id,fingerprint:candidateId,garmentFamily:draft.garmentFamily,artFamily:draft.artFamily,theme:candidate.theme,motif:draft.motif,palette:draft.palette,placement:draft.placement});
    if(r.outcome==='CREATED')tally.created++;
    else if(r.outcome==='EXISTS')tally.existing++;
    else if(r.outcome==='BUSY')tally.busy++;
    else if(r.outcome==='SKIPPED'){tally.skipped++;notices.add(r.notice)}
    else{tally.failed++;failCodes.add(r.code);if(r.code==='INVALID_CONFIG'||r.code==='BLOCKED_ENDPOINT')notices.add(`NEEDS_CONFIGURATION: graphic provider rejected configuration (${r.code})`)}
   }catch{tally.failed++;failCodes.add('INTERNAL')}
  }
  if(provider.status!=='REMOTE')notices.add(`NEEDS_CONFIGURATION: graphic provider ${provider.status}${provider.configIssue?` (${provider.configIssue})`:''}; only SIMULATION_ONLY placeholders were recorded`);
  if(failCodes.size)notices.add(`GRAPHIC_FAILURES: ${tally.failed} candidate(s) without artwork [${[...failCodes].join(',')}]`);
  const notice=[...notices].join(' | ').slice(0,500)||null;
  await prisma.jobRun.update({where:{id:runId},data:{status:'COMPLETED',completedAt:new Date(),processed:count,error:notice,payload:{...payload,graphic:{provider:provider.id,status:provider.status,spentInr:budget.spentInr,...tally,notice}}}});
  return {assembled:count,graphic:{status:provider.status,...tally},notice:notice??'Drafts assembled'};
 }catch(e){await prisma.jobRun.update({where:{id:runId},data:{status:'FAILED',error:e instanceof Error?e.message.slice(0,500):'Unknown error'}});throw e}
},{connection,concurrency:2});
worker.on('failed',(job,err)=>console.error('job failure',job?.id,err.message));
const shutdown=async()=>{await worker.close();await connection.quit();await prisma.$disconnect()};
process.on('SIGINT',()=>{void shutdown()});process.on('SIGTERM',()=>{void shutdown()});
console.log('Verse Mode draft-assembly worker ready; graphic provider resolved per job (remote GPU service or labelled sandbox)');
