import {createHash} from 'node:crypto';
export function normalizeText(value:string){return value.normalize('NFKC').toLocaleLowerCase('en').replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/g,' ').trim()}
export function quoteFingerprint(text:string,language:string){return createHash('sha256').update([language.toLowerCase(),normalizeText(text)].join('::')).digest('hex')}
export function designFingerprint(quoteHash:string,garment:string,artFamily:string){return createHash('sha256').update([quoteHash,garment.toLowerCase(),artFamily.toLowerCase()].join('::')).digest('hex')}
export function jaccard(a:string,b:string){const sa=new Set(normalizeText(a).split(' ').filter(Boolean));const sb=new Set(normalizeText(b).split(' ').filter(Boolean));const intersection=[...sa].filter(x=>sb.has(x)).length;const union=new Set([...sa,...sb]).size;return union?intersection/union:1}
