import {z} from 'zod';
import {assertAllowedUrl,parseAllowlist,SsrfError,type LookupFn} from '../ssrf';
import type {Env,GraphicProvider} from '../types';
import {DiffusersAdapter} from './diffusersAdapter';
import {FashnVtonAdapter} from './fashnVtonAdapter';
import type {RemoteConfig,RemoteEndpoint} from './remote';
/** Picks a configured REMOTE adapter, else a labelled sandbox. Env endpoints are operator-trusted (host auto-allowed); vault endpoints must be in PROVIDER_ALLOWED_HOSTS. */
export interface GraphicFactoryOptions{env?:Env;vaultAiRender?:string|null;fetchImpl?:typeof fetch;lookup?:LookupFn}
const vaultShape=z.object({url:z.string().min(1).max(2048),token:z.string().min(1).max(4096).optional()});
/** Vault AI_RENDER secret is either a bare URL or JSON `{"url":"...","token":"..."}`. Never log the result. */
export function parseVaultAiRender(secret:string):{url:string;token?:string}|null{
 const s=secret.trim();if(!s)return null;
 if(s.startsWith('{')){try{const p=vaultShape.safeParse(JSON.parse(s));return p.success?p.data:null}catch{return null}}
 return {url:s};
}
interface Resolved{remote?:RemoteConfig;configIssue?:string;costPerImageInr?:number}
function resolve(url:string|undefined,token:string|undefined,source:RemoteEndpoint['source'],o:GraphicFactoryOptions,env:Env):Resolved{
 const costRaw=env.AI_RENDER_COST_PER_IMAGE_INR;const costPerImageInr=costRaw?Number(costRaw):undefined;
 if(!url)return {};
 const nodeEnv=env.NODE_ENV;const allowedHosts=parseAllowlist(env.PROVIDER_ALLOWED_HOSTS);
 try{
  if(source==='env'){const probe=new URL(url);allowedHosts.push(probe.hostname.toLowerCase().replace(/^\[|\]$/g,''))}
  assertAllowedUrl(url,{allowedHosts,nodeEnv});
 }catch(e){return {configIssue:e instanceof SsrfError?e.message:'Endpoint URL is not valid',costPerImageInr}}
 return {remote:{endpoint:{baseUrl:url,token,source},allowedHosts,nodeEnv,fetchImpl:o.fetchImpl,lookup:o.lookup},costPerImageInr};
}
export function getDiffusersProvider(o:GraphicFactoryOptions={}):GraphicProvider{
 const env=o.env??process.env;
 if(env.DIFFUSERS_API_URL)return new DiffusersAdapter(resolve(env.DIFFUSERS_API_URL,env.DIFFUSERS_API_TOKEN||undefined,'env',o,env));
 const v=o.vaultAiRender?parseVaultAiRender(o.vaultAiRender):null;
 if(o.vaultAiRender&&!v)return new DiffusersAdapter({configIssue:'Vault AI_RENDER secret is not a URL or {url,token} JSON'});
 if(v)return new DiffusersAdapter(resolve(v.url,v.token,'vault',o,env));
 return new DiffusersAdapter();
}
export function getFashnVtonProvider(o:GraphicFactoryOptions={}):GraphicProvider{
 const env=o.env??process.env;
 return new FashnVtonAdapter(resolve(env.FASHN_VTON_API_URL,env.FASHN_VTON_API_TOKEN||undefined,'env',o,env));
}
export type GraphicProviderKind='diffusers'|'fashn-vton';
export function getGraphicProvider(kind:GraphicProviderKind,o:GraphicFactoryOptions={}):GraphicProvider{return kind==='diffusers'?getDiffusersProvider(o):getFashnVtonProvider(o)}
export {DiffusersAdapter,FashnVtonAdapter};
