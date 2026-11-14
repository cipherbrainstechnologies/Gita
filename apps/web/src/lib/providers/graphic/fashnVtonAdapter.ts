import {costInputSchema,fail,lifestyleInputSchema,ok,type CostEstimate,type CostInput,type FlatMockupInput,type GraphicOutput,type GraphicProvider,type GraphicStatus,type LifestyleInput,type MotifInput,type Result} from '../types';
import {postImage,type RemoteConfig} from './remote';
import {sandboxOutput} from './sandbox';
/**
 * Lifestyle try-on via an EXTERNAL FASHN VTON v1.5 GPU service (sibling repo `fashn-vton-1.5`). Never runs inference in-process.
 * Every output is a SIMULATION (isSimulation:true): it is not a sample proof and must not be sold as product photography.
 * Sandbox returns a labelled placeholder. Requires a licence check on the checkpoint, reported back in provenance.
 */
export interface FashnVtonConfig{remote?:RemoteConfig;costPerImageInr?:number;configIssue?:string}
export class FashnVtonAdapter implements GraphicProvider{
 readonly id='fashn-vton';readonly status:GraphicStatus;readonly configIssue?:string;
 constructor(private readonly cfg:FashnVtonConfig={}){this.status=cfg.remote?'REMOTE':cfg.configIssue?'INVALID_CONFIG':'NOT_CONFIGURED';this.configIssue=cfg.configIssue}
 estimateCost(input:CostInput):Result<CostEstimate>{
  if(!costInputSchema.safeParse(input).success)return fail(this.id,'DECLINED','Invalid cost estimate request');
  if(!this.cfg.remote)return ok({amountInr:0,currency:'INR',isSimulation:true,basis:'sandbox: no paid model invoked'});
  const c=this.cfg.costPerImageInr;if(c===undefined||!Number.isFinite(c)||c<0)return fail(this.id,'INVALID_CONFIG','AI_RENDER_COST_PER_IMAGE_INR is required to meter remote generation');
  return ok({amountInr:c,currency:'INR',isSimulation:true,basis:'configured per-image cost'});
 }
 async generateMotif(input:MotifInput):Promise<Result<GraphicOutput>>{void input;return fail(this.id,'UNSUPPORTED','Motif generation is handled by the diffusers adapter')}
 async generateFlatMockup(input:FlatMockupInput):Promise<Result<GraphicOutput>>{void input;return fail(this.id,'UNSUPPORTED','Flat mockups are handled by the diffusers adapter')}
 async generateLifestyleSimulation(input:LifestyleInput):Promise<Result<GraphicOutput>>{
  const p=lifestyleInputSchema.safeParse(input);if(!p.success)return fail(this.id,'DECLINED','Invalid lifestyle try-on request');
  const d=p.data;
  if(!this.cfg.remote)return ok(sandboxOutput({provider:this.id,kind:'LIFESTYLE_SIMULATION',seed:d.seed,idempotencyKey:d.idempotencyKey,category:d.category,configIssue:this.configIssue}));
  if(!d.garmentImageBase64||!d.garmentMimeType)return fail(this.id,'DECLINED','A garment image is required for try-on');
  return postImage(this.id,this.cfg.remote,'/v1/tryon',{seed:d.seed,category:d.category,garmentImageBase64:d.garmentImageBase64,garmentMimeType:d.garmentMimeType,personImageBase64:d.personImageBase64,personMimeType:d.personMimeType,checkpoint:d.licensedCheckpoint},{kind:'LIFESTYLE_SIMULATION',seed:d.seed,idempotencyKey:d.idempotencyKey});
 }
}
