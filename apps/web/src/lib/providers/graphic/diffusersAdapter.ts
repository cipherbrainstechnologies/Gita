import {costInputSchema,fail,flatMockupInputSchema,motifInputSchema,ok,type CostEstimate,type CostInput,type FlatMockupInput,type GraphicOutput,type GraphicProvider,type GraphicStatus,type LifestyleInput,type MotifInput,type Result} from '../types';
import {postImage,type RemoteConfig} from './remote';
import {sandboxOutput} from './sandbox';
/**
 * Motif / flat-mockup generation via an EXTERNAL diffusers GPU service (sibling repo `diffusers`). Never runs inference in-process.
 * Without an endpoint (or with an invalid one) it emits labelled deterministic sandbox simulations only.
 * Unicode quote text must NOT be sent here: it is set by a deterministic typesetter, not a model.
 */
export interface DiffusersConfig{remote?:RemoteConfig;costPerImageInr?:number;configIssue?:string}
export class DiffusersAdapter implements GraphicProvider{
 readonly id='diffusers';readonly status:GraphicStatus;readonly configIssue?:string;
 constructor(private readonly cfg:DiffusersConfig={}){this.status=cfg.remote?'REMOTE':cfg.configIssue?'INVALID_CONFIG':'NOT_CONFIGURED';this.configIssue=cfg.configIssue}
 estimateCost(input:CostInput):Result<CostEstimate>{
  const p=costInputSchema.safeParse(input);if(!p.success)return fail(this.id,'DECLINED','Invalid cost estimate request');
  if(!this.cfg.remote)return ok({amountInr:0,currency:'INR',isSimulation:true,basis:'sandbox: no paid model invoked'});
  const c=this.cfg.costPerImageInr;if(c===undefined||!Number.isFinite(c)||c<0)return fail(this.id,'INVALID_CONFIG','AI_RENDER_COST_PER_IMAGE_INR is required to meter remote generation');
  return ok({amountInr:c,currency:'INR',isSimulation:false,basis:'configured per-image cost'});
 }
 async generateMotif(input:MotifInput):Promise<Result<GraphicOutput>>{
  const p=motifInputSchema.safeParse(input);if(!p.success)return fail(this.id,'DECLINED','Invalid motif request');
  const d=p.data;
  if(!this.cfg.remote)return ok(sandboxOutput({provider:this.id,kind:'MOTIF',seed:d.seed,idempotencyKey:d.idempotencyKey,modelVersion:d.modelVersion,promptVersion:d.promptVersion,palette:d.palette,configIssue:this.configIssue}));
  return postImage(this.id,this.cfg.remote,'/v1/motif',{seed:d.seed,prompt:d.prompt,motif:d.motif,palette:d.palette,placement:d.placement,checkpoint:d.licensedCheckpoint,modelVersion:d.modelVersion},{kind:'MOTIF',seed:d.seed,idempotencyKey:d.idempotencyKey,promptVersion:d.promptVersion});
 }
 async generateFlatMockup(input:FlatMockupInput):Promise<Result<GraphicOutput>>{
  const p=flatMockupInputSchema.safeParse(input);if(!p.success)return fail(this.id,'DECLINED','Invalid flat mockup request');
  const d=p.data;
  if(!this.cfg.remote)return ok(sandboxOutput({provider:this.id,kind:'FLAT_MOCKUP',seed:d.seed,idempotencyKey:d.idempotencyKey,modelVersion:d.modelVersion,promptVersion:d.promptVersion,garmentFamily:d.garmentFamily,colour:d.colour,artwork:d.artworkBase64&&d.artworkMimeType?{mime:d.artworkMimeType,b64:d.artworkBase64}:undefined,configIssue:this.configIssue}));
  return postImage(this.id,this.cfg.remote,'/v1/flat-mockup',{seed:d.seed,garmentFamily:d.garmentFamily,colour:d.colour,placement:d.placement,artworkBase64:d.artworkBase64,artworkMimeType:d.artworkMimeType,checkpoint:d.licensedCheckpoint,modelVersion:d.modelVersion},{kind:'FLAT_MOCKUP',seed:d.seed,idempotencyKey:d.idempotencyKey,promptVersion:d.promptVersion});
 }
 async generateLifestyleSimulation(input:LifestyleInput):Promise<Result<GraphicOutput>>{void input;return fail(this.id,'UNSUPPORTED','Lifestyle try-on is handled by the FASHN VTON adapter')}
}
