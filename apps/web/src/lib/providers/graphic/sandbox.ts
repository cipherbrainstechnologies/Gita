import {createHash} from 'node:crypto';
import type {GraphicKind,GraphicOutput,GraphicProvenance} from '../types';
/** Deterministic labelled SVG placeholders. NO model is invoked; output is never AI artwork. */
export const SANDBOX_NOTICE='SIMULATION - provider NOT CONFIGURED; deterministic placeholder, no AI model was invoked';
function rng(seed:string){let h=createHash('sha256').update(seed).digest();let i=0;return()=>{if(i>=h.length){h=createHash('sha256').update(h).digest();i=0}return h[i++]/255}}
function colours(palette:string,r:()=>number):string[]{
 const found=(palette.match(/#[0-9a-fA-F]{6}\b/g)??[]).map(c=>c.toLowerCase()).slice(0,5);
 if(found.length>=2)return found;
 const base=Math.floor(r()*360);
 return [0,1,2,3].map(i=>`hsl(${(base+i*47)%360} 55% ${28+i*14}%)`);
}
const safeLabel=(s:string)=>s.replace(/[^A-Za-z0-9 _-]/g,'').slice(0,40);
const banner=(w:number,h:number,text:string)=>`<rect x="0" y="${h-56}" width="${w}" height="56" fill="#111"/><text x="${w/2}" y="${h-20}" font-family="monospace" font-size="22" fill="#fff" text-anchor="middle">${text}</text>`;
const n=(v:number)=>Math.round(v*10)/10;
function motifSvg(seed:string,palette:string):string{
 const r=rng(`motif|${seed}`);const cs=colours(palette,r);let shapes='';
 for(let i=0;i<9;i++){
  const c=cs[i%cs.length],x=n(120+r()*784),y=n(120+r()*700),s=n(40+r()*150),o=n(0.45+r()*0.5);
  if(i%3===0)shapes+=`<circle cx="${x}" cy="${y}" r="${s}" fill="${c}" opacity="${o}"/>`;
  else if(i%3===1)shapes+=`<rect x="${n(x-s/2)}" y="${n(y-s/2)}" width="${s}" height="${s}" fill="${c}" opacity="${o}" transform="rotate(${Math.floor(r()*90)} ${x} ${y})"/>`;
  else shapes+=`<polygon points="${x},${n(y-s)} ${n(x+s)},${n(y+s)} ${n(x-s)},${n(y+s)}" fill="${c}" opacity="${o}"/>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="SIMULATION motif placeholder"><rect width="1024" height="1024" fill="#f4f1ea"/>${shapes}${banner(1024,1024,'SIMULATION - NOT AI ARTWORK')}</svg>`;
}
const SILHOUETTE={tee:'M300 140 L420 100 Q512 150 604 100 L724 140 L860 300 L770 360 L720 310 L720 880 L304 880 L304 310 L254 360 L164 300 Z',pant:'M320 120 L704 120 L760 900 L560 900 L512 380 L464 900 L264 900 Z'};
function pickSilhouette(g:string){return /pant|track|jogger|trouser|bottom/i.test(g)?SILHOUETTE.pant:SILHOUETTE.tee}
function mockupSvg(seed:string,garment:string,colour:string|undefined,embedded?:{mime:string;b64:string}):string{
 const r=rng(`mockup|${seed}`);const fill=colour&&/^#[0-9a-fA-F]{6}$/.test(colour)?colour:`hsl(${Math.floor(r()*360)} 10% 82%)`;
 const art=embedded?`<image href="data:${embedded.mime};base64,${embedded.b64}" x="362" y="300" width="300" height="300"/>`:`<rect x="372" y="310" width="280" height="280" fill="none" stroke="#111" stroke-dasharray="10 8"/><text x="512" y="456" font-family="monospace" font-size="20" text-anchor="middle" fill="#111">ART AREA</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="SIMULATION flat mockup placeholder: ${safeLabel(garment)}"><rect width="1024" height="1024" fill="#fff"/><path d="${pickSilhouette(garment)}" fill="${fill}" stroke="#111" stroke-width="4"/>${art}${banner(1024,1024,'SIMULATION - NOT A SAMPLE PROOF')}</svg>`;
}
function lifestyleSvg(seed:string,category:string):string{
 const r=rng(`life|${seed}`);const h=Math.floor(r()*360);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 1024" width="768" height="1024" role="img" aria-label="SIMULATION lifestyle try-on placeholder"><rect width="768" height="1024" fill="hsl(${h} 18% 88%)"/><circle cx="384" cy="190" r="86" fill="hsl(${h} 12% 62%)"/><rect x="274" y="290" width="220" height="460" rx="40" fill="hsl(${h} 30% 45%)"/><text x="384" y="800" font-family="monospace" font-size="22" text-anchor="middle" fill="#111">${safeLabel(category)}</text>${banner(768,1024,'SIMULATION - NOT A REAL TRY-ON')}</svg>`;
}
export interface SandboxArgs{provider:string;kind:GraphicKind;seed:string;idempotencyKey:string;modelVersion?:string;promptVersion?:string;configIssue?:string;palette?:string;garmentFamily?:string;colour?:string;category?:string;artwork?:{mime:string;b64:string}}
export function sandboxOutput(a:SandboxArgs):GraphicOutput{
 const svg=a.kind==='MOTIF'?motifSvg(a.seed,a.palette??''):a.kind==='FLAT_MOCKUP'?mockupSvg(a.seed,a.garmentFamily??'tee',a.colour,a.artwork):lifestyleSvg(a.seed,a.category??'tops');
 const bytes=Buffer.from(svg,'utf8');
 const provenance:GraphicProvenance={provider:a.provider,mode:'SANDBOX',kind:a.kind,isSimulation:true,seed:a.seed,idempotencyKey:a.idempotencyKey,modelName:'sandbox-placeholder',modelVersion:a.modelVersion??'sandbox-v1',modelLicense:'N/A (no model invoked)',outputLicense:'N/A (simulation; not for sale or publication)',promptVersion:a.promptVersion,notice:SANDBOX_NOTICE,configIssue:a.configIssue};
 return {kind:a.kind,bytes,mimeType:'image/svg+xml',sha256:createHash('sha256').update(bytes).digest('hex'),isSimulation:true,provenance};
}
