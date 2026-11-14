import {createHash} from 'node:crypto';
import {z} from 'zod';
import {assertAllowedUrl,assertResolvedPublic,SsrfError,type LookupFn} from '../ssrf';
import {fail,ok,type GraphicKind,type GraphicOutput,type Result} from '../types';
/**
 * Shared HTTP client for external GPU services (diffusers wrapper, FASHN VTON wrapper).
 * Contract: POST {base}{path} JSON -> {imageBase64,mimeType,modelName,modelVersion,modelLicense,outputLicense,requestId?,costInr?}.
 * Never logs URLs with credentials, tokens or request bodies.
 */
export interface RemoteEndpoint{baseUrl:string;token?:string;source:'env'|'vault'}
export interface RemoteConfig{endpoint:RemoteEndpoint;allowedHosts:string[];nodeEnv?:string;fetchImpl?:typeof fetch;lookup?:LookupFn;timeoutMs?:number;maxAttempts?:number;sleep?:(ms:number)=>Promise<void>}
const MAX_BODY=25_000_000;
const imageResponse=z.object({imageBase64:z.string().min(8),mimeType:z.enum(['image/png','image/jpeg','image/webp']),modelName:z.string().min(1).max(200),modelVersion:z.string().min(1).max(100),modelLicense:z.string().min(1).max(200),outputLicense:z.string().min(1).max(200),requestId:z.string().max(200).optional(),costInr:z.number().nonnegative().optional()});
function magicOk(b:Buffer,mime:string){
 if(mime==='image/png')return b.length>8&&b.subarray(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47]));
 if(mime==='image/jpeg')return b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
 return b.length>12&&b.subarray(0,4).toString('latin1')==='RIFF'&&b.subarray(8,12).toString('latin1')==='WEBP';
}
export async function postImage(provider:string,cfg:RemoteConfig,path:string,body:Record<string,unknown>,meta:{kind:GraphicKind;seed:string;idempotencyKey:string;promptVersion?:string}):Promise<Result<GraphicOutput>>{
 const opts={allowedHosts:cfg.allowedHosts,nodeEnv:cfg.nodeEnv};
 let url:URL;
 try{
  const base=assertAllowedUrl(cfg.endpoint.baseUrl,opts);
  url=new URL(path.replace(/^\//,''),base.href.endsWith('/')?base.href:`${base.href}/`);
  await assertResolvedPublic(url,opts,cfg.lookup);
 }catch(e){return fail(provider,'BLOCKED_ENDPOINT',e instanceof SsrfError?e.message:'Endpoint validation failed')}
 const doFetch=cfg.fetchImpl??fetch,sleep=cfg.sleep??(ms=>new Promise<void>(r=>setTimeout(r,ms))),attempts=cfg.maxAttempts??2;
 let last=fail(provider,'UNAVAILABLE','Remote GPU service unreachable');
 for(let i=1;i<=attempts;i++){
  if(i>1)await sleep(400*i);
  let res:Response;
  try{
   res=await doFetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(cfg.timeoutMs??120_000),headers:{'content-type':'application/json',accept:'application/json','idempotency-key':meta.idempotencyKey,...(cfg.endpoint.token?{authorization:`Bearer ${cfg.endpoint.token}`}:{})},body:JSON.stringify(body)});
  }catch{last=fail(provider,'UNAVAILABLE','Remote GPU service unreachable or timed out');continue}
  if(res.status===401||res.status===403)return fail(provider,'INVALID_CONFIG','Remote GPU service rejected credentials');
  if(res.status===429||res.status>=500){last=fail(provider,'UNAVAILABLE',`Remote GPU service unavailable (HTTP ${res.status})`);continue}
  if(!res.ok)return fail(provider,'DECLINED',`Remote GPU service declined request (HTTP ${res.status})`);
  const len=Number(res.headers.get('content-length')??0);if(len>MAX_BODY)return fail(provider,'INVALID_RESPONSE','Remote response too large');
  let json:unknown;try{const text=await res.text();if(text.length>MAX_BODY)return fail(provider,'INVALID_RESPONSE','Remote response too large');json=JSON.parse(text)}catch{return fail(provider,'INVALID_RESPONSE','Remote response is not valid JSON')}
  const parsed=imageResponse.safeParse(json);if(!parsed.success)return fail(provider,'INVALID_RESPONSE','Remote response missing required fields (image, model and licence provenance)');
  const d=parsed.data;const bytes=Buffer.from(d.imageBase64,'base64');
  if(!magicOk(bytes,d.mimeType))return fail(provider,'INVALID_RESPONSE','Remote image bytes do not match declared MIME type');
  return ok({kind:meta.kind,bytes,mimeType:d.mimeType,sha256:createHash('sha256').update(bytes).digest('hex'),isSimulation:meta.kind==='LIFESTYLE_SIMULATION',provenance:{provider,mode:'REMOTE',kind:meta.kind,isSimulation:meta.kind==='LIFESTYLE_SIMULATION',seed:meta.seed,idempotencyKey:meta.idempotencyKey,modelName:d.modelName,modelVersion:d.modelVersion,modelLicense:d.modelLicense,outputLicense:d.outputLicense,promptVersion:meta.promptVersion,requestId:d.requestId,costInr:d.costInr}});
 }
 return last;
}
