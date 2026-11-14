import {isIP} from 'node:net';
import {lookup as dnsLookup} from 'node:dns/promises';
/** SSRF guard for operator/vault-configured provider URLs. Private ranges are blocked unless NODE_ENV=development. */
export class SsrfError extends Error{constructor(message:string){super(message);this.name='SsrfError'}}
export interface SsrfOptions{allowedHosts:string[];nodeEnv?:string}
export type LookupFn=(host:string,opts:{all:true})=>Promise<{address:string}[]>;
const isDev=(nodeEnv?:string)=>nodeEnv==='development';
export function parseAllowlist(raw?:string|null):string[]{return (raw??'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)}
/** Exact match, or `*.example.com` (subdomains only). */
export function hostAllowed(host:string,allowed:string[]):boolean{return allowed.some(p=>p.startsWith('*.')?host.endsWith(p.slice(1)):p===host)}
function v4Private(a:number,b:number,c:number):boolean{
 return a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===192&&b===0&&c===0)||(a===198&&(b===18||b===19))||(a===192&&b===0&&c===2)||(a===198&&b===51&&c===100)||(a===203&&b===0&&c===113);
}
function parseV6(ip:string):number[]|null{
 let s=ip.toLowerCase();const z=s.indexOf('%');if(z>=0)s=s.slice(0,z);
 const m=s.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
 if(m){const p=m[2].split('.').map(Number);if(p.length!==4||p.some(n=>!(n>=0&&n<=255)))return null;s=m[1]+((p[0]<<8)|p[1]).toString(16)+':'+((p[2]<<8)|p[3]).toString(16)}
 const halves=s.split('::');if(halves.length>2)return null;
 const head=halves[0]?halves[0].split(':'):[];const tail=halves.length===2&&halves[1]?halves[1].split(':'):[];
 const fill=halves.length===2?8-head.length-tail.length:0;if(fill<0||(halves.length===1&&head.length!==8))return null;
 const groups=[...head,...Array(fill).fill('0'),...tail].map(g=>parseInt(g,16));
 return groups.length===8&&groups.every(n=>Number.isInteger(n)&&n>=0&&n<=0xffff)?groups:null;
}
/** True for loopback, private, link-local, multicast, reserved and unparseable addresses (fail closed). */
export function isPrivateAddress(ip:string):boolean{
 const kind=isIP(ip);
 if(kind===4){const [a,b,c]=ip.split('.').map(Number);return v4Private(a,b,c)}
 if(kind===6){
  const g=parseV6(ip);if(!g)return true;
  const lowZero=g.slice(0,5).every(n=>n===0);
  if(lowZero&&g[5]===0)return true; // ::, ::1, deprecated v4-compatible
  if(lowZero&&g[5]===0xffff)return v4Private(g[6]>>8,g[6]&255,g[7]>>8); // v4-mapped
  if(g[0]===0x64&&g[1]===0xff9b&&g.slice(2,6).every(n=>n===0))return v4Private(g[6]>>8,g[6]&255,g[7]>>8); // NAT64
  if(g[0]===0x2002)return v4Private(g[1]>>8,g[1]&255,g[2]>>8); // 6to4
  return (g[0]&0xfe00)===0xfc00||(g[0]&0xffc0)===0xfe80||(g[0]&0xff00)===0xff00||(g[0]===0x2001&&g[1]===0x0db8);
 }
 return true;
}
const PRIVATE_NAME=/(^|\.)(localhost|local|internal|lan|home|corp)$/;
/** Synchronous structural check: scheme, credentials, allowlist, private literals/names. Returns the parsed URL. */
export function assertAllowedUrl(raw:string,opts:SsrfOptions):URL{
 let url:URL;try{url=new URL(raw)}catch{throw new SsrfError('Endpoint URL is not valid')}
 const dev=isDev(opts.nodeEnv);
 if(url.protocol!=='https:'&&!(dev&&url.protocol==='http:'))throw new SsrfError('Endpoint must use https');
 if(url.username||url.password)throw new SsrfError('Endpoint URL must not embed credentials');
 const host=url.hostname.toLowerCase().replace(/\.$/,'').replace(/^\[|\]$/g,'');
 if(!host||!hostAllowed(host,opts.allowedHosts))throw new SsrfError(`Host "${host}" is not in the provider allowlist`);
 if(!dev){
  if(isIP(host)&&isPrivateAddress(host))throw new SsrfError('Private or reserved addresses are blocked');
  if(PRIVATE_NAME.test(host))throw new SsrfError('Internal hostnames are blocked');
 }
 return url;
}
/** DNS-level check: every resolved address must be public (skipped in development). Call immediately before connecting. */
export async function assertResolvedPublic(url:URL,opts:SsrfOptions,lookup:LookupFn=dnsLookup as unknown as LookupFn):Promise<void>{
 if(isDev(opts.nodeEnv))return;
 const host=url.hostname.replace(/^\[|\]$/g,'');
 if(isIP(host))return; // literal already vetted by assertAllowedUrl
 let addrs:{address:string}[];
 try{addrs=await lookup(host,{all:true})}catch{throw new SsrfError('Endpoint host could not be resolved')}
 if(!addrs.length||addrs.some(a=>isPrivateAddress(a.address)))throw new SsrfError('Endpoint resolves to a private or reserved address');
}
