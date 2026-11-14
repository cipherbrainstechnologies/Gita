import {Prisma,type PrismaClient} from '@prisma/client';
import type {GraphicProvider,ProviderFailureCode} from '../types';
import type {AssetStore} from './assetStore';
/**
 * Generates revision-1 artwork (motif + flat mockup) for one DesignCandidate.
 * Idempotent: DesignVersion(candidateId,1) is unique, and ExternalIdempotency claims prevent two workers paying for the same render.
 * Sandbox output is stored as SIMULATION_ONLY and can never be approved as real artwork.
 */
export const PROMPT_VERSION='verse-motif-v1';
export const GENERATION_REVISION=1;
export interface BudgetState{spentInr:number;budgetInr:number;stop?:string}
export interface EnrichContext{prisma:PrismaClient;provider:GraphicProvider;store:AssetStore;budget:BudgetState;licensedCheckpoint?:string;claimTtlMs?:number}
export interface EnrichInput{candidateId:string;fingerprint:string;garmentFamily:string;artFamily:string;theme:string;motif:string;palette:string;placement:string}
export type EnrichOutcome={outcome:'CREATED'}|{outcome:'EXISTS'}|{outcome:'BUSY'}|{outcome:'SKIPPED';notice:string}|{outcome:'FAILED';code:ProviderFailureCode;retryable:boolean};
const OP='GRAPHIC_GENERATE';
const isUnique=(e:unknown)=>(e as {code?:string}|null)?.code==='P2002';
async function claim(prisma:PrismaClient,key:string,ttlMs:number):Promise<'CLAIMED'|'DONE'|'BUSY'>{
 const expiresAt=new Date(Date.now()+ttlMs);
 try{await prisma.externalIdempotency.create({data:{operation:OP,externalKey:key,expiresAt}});return 'CLAIMED'}catch(e){if(!isUnique(e))throw e}
 const row=await prisma.externalIdempotency.findUnique({where:{operation_externalKey:{operation:OP,externalKey:key}}});
 if(!row)return 'BUSY';
 if(row.result)return 'DONE';
 if(!row.expiresAt||row.expiresAt>new Date())return 'BUSY';
 const taken=await prisma.externalIdempotency.updateMany({where:{id:row.id,expiresAt:row.expiresAt},data:{expiresAt}}); // atomic take-over of an abandoned claim
 return taken.count===1?'CLAIMED':'BUSY';
}
const release=(prisma:PrismaClient,key:string)=>prisma.externalIdempotency.deleteMany({where:{operation:OP,externalKey:key,result:{equals:Prisma.DbNull}}}).catch(()=>undefined);
export async function enrichCandidate(ctx:EnrichContext,c:EnrichInput):Promise<EnrichOutcome>{
 const {prisma,provider,store,budget}=ctx;
 const existing=await prisma.designVersion.findUnique({where:{candidateId_revision:{candidateId:c.candidateId,revision:GENERATION_REVISION}},select:{id:true}});
 if(existing)return {outcome:'EXISTS'};
 const remote=provider.status==='REMOTE';
 let perImage=0;
 if(remote){
  if(budget.stop)return {outcome:'SKIPPED',notice:budget.stop};
  if(!store.persistent)return {outcome:'SKIPPED',notice:'NEEDS_CONFIGURATION: ASSET_STORAGE_DIR is required before paid generation (outputs would be lost)'};
  if(!ctx.licensedCheckpoint)return {outcome:'SKIPPED',notice:'NEEDS_CONFIGURATION: AI_RENDER_LICENSED_CHECKPOINT (licence-verified checkpoint) is required'};
  const est=provider.estimateCost({prompt:c.motif||'motif',motif:c.motif});
  if(!est.ok)return {outcome:'SKIPPED',notice:`NEEDS_CONFIGURATION: ${est.error.message}`};
  perImage=est.value.amountInr;
  if(budget.spentInr+perImage*2>budget.budgetInr){budget.stop='BUDGET_EXCEEDED: AI_RENDER_BUDGET_INR reached; remaining candidates have no generated artwork';return {outcome:'SKIPPED',notice:budget.stop}}
 }
 const key=`${c.fingerprint}:${PROMPT_VERSION}:r${GENERATION_REVISION}`;
 const state=await claim(prisma,key,ctx.claimTtlMs??15*60_000);
 if(state==='DONE')return {outcome:'EXISTS'};
 if(state==='BUSY')return {outcome:'BUSY'};
 const checkpoint=ctx.licensedCheckpoint||'sandbox-none';
 const prompt=`${c.motif||c.artFamily} motif, ${c.theme}, ${c.artFamily} style; no lettering`; // quote text is never sent to a model (deterministic typesetter owns text)
 try{
  const motif=await provider.generateMotif({seed:c.fingerprint,prompt,motif:c.motif,palette:c.palette,placement:c.placement,licensedCheckpoint:checkpoint,promptVersion:PROMPT_VERSION,idempotencyKey:`${key}:motif`});
  if(!motif.ok){await release(prisma,key);return {outcome:'FAILED',code:motif.error.code,retryable:motif.error.retryable}}
  if(remote)budget.spentInr+=motif.value.provenance.costInr??perImage;
  const art=motif.value;
  const mock=await provider.generateFlatMockup({seed:c.fingerprint,garmentFamily:c.garmentFamily,placement:c.placement,artworkBase64:art.bytes.length<=10_000_000?art.bytes.toString('base64'):undefined,artworkMimeType:art.bytes.length<=10_000_000?art.mimeType as 'image/png':undefined,licensedCheckpoint:checkpoint,promptVersion:PROMPT_VERSION,idempotencyKey:`${key}:mockup`});
  if(!mock.ok){await release(prisma,key);return {outcome:'FAILED',code:mock.error.code,retryable:mock.error.retryable}}
  if(remote)budget.spentInr+=mock.value.provenance.costInr??perImage;
  const saved=await Promise.all([art,mock.value].map(async o=>({o,...await store.put(o)})));
  const [a,m]=saved;
  const sim=a.o.isSimulation||m.o.isSimulation||provider.status!=='REMOTE';
  try{
   await prisma.$transaction(async tx=>{
    const asset=(s:typeof a,type:string)=>tx.mediaAsset.upsert({where:{storageKey:s.storageKey},create:{storageKey:s.storageKey,sha256:s.o.sha256,mimeType:s.o.mimeType,bytes:s.o.bytes.length,assetType:type,isSimulation:s.o.isSimulation,provenance:{...s.o.provenance,persisted:s.persisted} as unknown as Prisma.InputJsonValue},update:{}});
    const [artwork,preview]=[await asset(a,'DESIGN_MOTIF'),await asset(m,'FLAT_MOCKUP')];
    await tx.designVersion.create({data:{candidateId:c.candidateId,revision:GENERATION_REVISION,promptVersion:PROMPT_VERSION,modelName:art.provenance.modelName,modelLicense:art.provenance.modelLicense,outputLicense:art.provenance.outputLicense,approvalStatus:sim?'SIMULATION_ONLY':'DRAFT',assetHash:art.sha256,artworkAssetId:artwork.id,previewAssetId:preview.id,techPack:{provider:provider.id,mode:art.provenance.mode,isSimulation:sim,idempotencyKey:key} as Prisma.InputJsonValue}});
    await tx.externalIdempotency.updateMany({where:{operation:OP,externalKey:key},data:{result:{done:true,artworkSha256:art.sha256} as Prisma.InputJsonValue}});
   });
  }catch(e){if(isUnique(e)&&await prisma.designVersion.findUnique({where:{candidateId_revision:{candidateId:c.candidateId,revision:GENERATION_REVISION}},select:{id:true}}))return {outcome:'EXISTS'};throw e}
  return {outcome:'CREATED'};
 }catch(e){await release(prisma,key);throw e}
}
