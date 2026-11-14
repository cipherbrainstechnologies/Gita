import {describe,it,expect,vi} from 'vitest';
import {getDiffusersProvider,getFashnVtonProvider,getGraphicProvider,parseVaultAiRender} from './index';
import {DiffusersAdapter} from './diffusersAdapter';
import {createAssetStore,storageKeyFor} from './assetStore';
const motif={seed:'seed-1',prompt:'lotus motif',motif:'lotus',palette:'#112233 #ddeeff',placement:'chest',licensedCheckpoint:'ckpt-licensed',idempotencyKey:'idem-1'};
const png=Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),Buffer.alloc(32,1)]);
const okBody=(over:object={})=>JSON.stringify({imageBase64:png.toString('base64'),mimeType:'image/png',modelName:'sdxl',modelVersion:'1.0',modelLicense:'openrail++',outputLicense:'commercial-ok',requestId:'r1',costInr:3,...over});
const lookup=async()=>[{address:'93.184.216.34'}];
describe('sandbox graphic output',()=>{
 it('is deterministic, labelled as simulation, and invokes no network',async()=>{
  const fetchImpl=vi.fn();
  const p=getDiffusersProvider({env:{},fetchImpl:fetchImpl as unknown as typeof fetch});
  expect(p.status).toBe('NOT_CONFIGURED');
  const a=await p.generateMotif(motif),b=await p.generateMotif(motif);
  expect(a.ok&&b.ok).toBe(true);if(!a.ok||!b.ok)return;
  expect(a.value.sha256).toBe(b.value.sha256);expect(a.value.bytes.equals(b.value.bytes)).toBe(true);
  expect(a.value.mimeType).toBe('image/svg+xml');expect(a.value.isSimulation).toBe(true);
  expect(a.value.bytes.toString()).toContain('SIMULATION');expect(a.value.bytes.toString().startsWith('<svg')).toBe(true);
  expect(a.value.provenance).toMatchObject({mode:'SANDBOX',isSimulation:true,provider:'diffusers',modelName:'sandbox-placeholder',idempotencyKey:'idem-1'});
  expect(a.value.provenance.notice).toMatch(/NOT CONFIGURED/);
  const c=await p.generateMotif({...motif,seed:'seed-2'});expect(c.ok&&c.value.sha256).not.toBe(a.value.sha256);
  expect(fetchImpl).not.toHaveBeenCalled();
 });
 it('renders flat mockups for tees and pants and embeds artwork safely',async()=>{
  const p=getDiffusersProvider({env:{}});
  const tee=await p.generateFlatMockup({seed:'s',garmentFamily:'Oversized Tee',placement:'chest',licensedCheckpoint:'x',idempotencyKey:'i'});
  const pant=await p.generateFlatMockup({seed:'s',garmentFamily:'Track Pant',placement:'thigh',licensedCheckpoint:'x',idempotencyKey:'i'});
  const evil=await p.generateFlatMockup({seed:'s',garmentFamily:'"><script>alert(1)</script>',placement:'chest',colour:'red"/><script>',licensedCheckpoint:'x',idempotencyKey:'i'});
  expect(tee.ok&&pant.ok&&evil.ok).toBe(true);if(!tee.ok||!pant.ok||!evil.ok)return;
  expect(tee.value.sha256).not.toBe(pant.value.sha256);
  expect(evil.value.bytes.toString()).not.toContain('<script');
 });
 it('lifestyle try-on is always isSimulation:true (sandbox)',async()=>{
  const p=getFashnVtonProvider({env:{}});
  expect(p.status).toBe('NOT_CONFIGURED');
  const r=await p.generateLifestyleSimulation({seed:'s',category:'tops',licensedCheckpoint:'x',idempotencyKey:'i'});
  expect(r.ok&&r.value.isSimulation).toBe(true);expect(r.ok&&r.value.provenance.isSimulation).toBe(true);expect(r.ok&&r.value.bytes.toString()).toContain('NOT A REAL TRY-ON');
  expect((await p.generateMotif(motif)).ok).toBe(false);
 });
 it('validates inputs with typed DECLINED failures',async()=>{
  const r=await getDiffusersProvider({env:{}}).generateMotif({...motif,seed:''});expect(!r.ok&&r.error.code).toBe('DECLINED');
 });
 it('sandbox cost estimate is zero and flagged simulation',()=>{const r=getDiffusersProvider({env:{}}).estimateCost({prompt:'x'});expect(r.ok&&r.value).toMatchObject({amountInr:0,isSimulation:true})});
});
describe('factory selection',()=>{
 const base={AI_RENDER_COST_PER_IMAGE_INR:'4'};
 it('picks remote for env URLs and auto-allowlists the env host',()=>{
  const p=getDiffusersProvider({env:{...base,NODE_ENV:'production',DIFFUSERS_API_URL:'https://gpu.example.com'}});expect(p.status).toBe('REMOTE');
  expect(getFashnVtonProvider({env:{NODE_ENV:'production',FASHN_VTON_API_URL:'https://vton.example.com'}}).status).toBe('REMOTE');
  expect(getGraphicProvider('diffusers',{env:{}}).id).toBe('diffusers');expect(getGraphicProvider('fashn-vton',{env:{}}).id).toBe('fashn-vton');
 });
 it('reports INVALID_CONFIG (still sandbox) for blocked env URLs',async()=>{
  for(const url of ['https://127.0.0.1','http://gpu.example.com','https://u:p@gpu.example.com','nonsense']){
   const p=getDiffusersProvider({env:{NODE_ENV:'production',DIFFUSERS_API_URL:url}});expect(p.status,url).toBe('INVALID_CONFIG');expect(p.configIssue).toBeTruthy();
   const r=await p.generateMotif(motif);expect(r.ok&&r.value.provenance.configIssue).toBeTruthy();expect(r.ok&&r.value.isSimulation).toBe(true);
  }
 });
 it('vault endpoint must be in PROVIDER_ALLOWED_HOSTS; env wins over vault',()=>{
  expect(getDiffusersProvider({env:{NODE_ENV:'production'},vaultAiRender:'https://vault.example.com'}).status).toBe('INVALID_CONFIG');
  expect(getDiffusersProvider({env:{NODE_ENV:'production',PROVIDER_ALLOWED_HOSTS:'vault.example.com'},vaultAiRender:JSON.stringify({url:'https://vault.example.com',token:'t'})}).status).toBe('REMOTE');
  expect(getDiffusersProvider({env:{NODE_ENV:'production'},vaultAiRender:'{bad'}).status).toBe('INVALID_CONFIG');
  expect(getDiffusersProvider({env:{NODE_ENV:'production',DIFFUSERS_API_URL:'https://gpu.example.com'},vaultAiRender:'https://other.com'}).status).toBe('REMOTE');
  expect(parseVaultAiRender(' ')).toBeNull();expect(parseVaultAiRender('https://a.b')).toEqual({url:'https://a.b'});
 });
 it('development allows localhost endpoints',()=>{expect(getDiffusersProvider({env:{NODE_ENV:'development',DIFFUSERS_API_URL:'http://localhost:8000'}}).status).toBe('REMOTE')});
});
describe('remote diffusers via mocked fetch',()=>{
 const make=(fetchImpl:unknown,extra:Record<string,string>={})=>getDiffusersProvider({env:{NODE_ENV:'production',DIFFUSERS_API_URL:'https://gpu.example.com/api',DIFFUSERS_API_TOKEN:'tok-secret',AI_RENDER_COST_PER_IMAGE_INR:'4',...extra},fetchImpl:fetchImpl as typeof fetch,lookup});
 it('returns provenance incl. model licence and sends bearer + idempotency headers',async()=>{
  const f=vi.fn(async()=>new Response(okBody(),{status:200}));
  const r=await make(f).generateMotif(motif);
  expect(r.ok).toBe(true);if(!r.ok)return;
  expect(r.value.provenance).toMatchObject({mode:'REMOTE',modelLicense:'openrail++',isSimulation:false,costInr:3});expect(r.value.mimeType).toBe('image/png');
  const [url,init]=f.mock.calls[0] as unknown as [URL,RequestInit];
  expect(String(url)).toBe('https://gpu.example.com/api/v1/motif');
  const h=init.headers as Record<string,string>;expect(h.authorization).toBe('Bearer tok-secret');expect(h['idempotency-key']).toBe('idem-1');expect(init.redirect).toBe('error');
 });
 it('marks remote lifestyle output isSimulation:true',async()=>{
  const p=getFashnVtonProvider({env:{NODE_ENV:'production',FASHN_VTON_API_URL:'https://vton.example.com'},fetchImpl:(async()=>new Response(okBody()))as unknown as typeof fetch,lookup});
  const r=await p.generateLifestyleSimulation({seed:'s',category:'tops',garmentImageBase64:png.toString('base64'),garmentMimeType:'image/png',licensedCheckpoint:'x',idempotencyKey:'i'});
  expect(r.ok&&r.value.isSimulation).toBe(true);
  const noGarment=await p.generateLifestyleSimulation({seed:'s',category:'tops',licensedCheckpoint:'x',idempotencyKey:'i'});expect(!noGarment.ok&&noGarment.error.code).toBe('DECLINED');
 });
 it('blocks DNS-rebinding endpoints before any request',async()=>{
  const f=vi.fn();const r=await getDiffusersProvider({env:{NODE_ENV:'production',DIFFUSERS_API_URL:'https://gpu.example.com'},fetchImpl:f as unknown as typeof fetch,lookup:async()=>[{address:'10.0.0.9'}]}).generateMotif(motif);
  expect(!r.ok&&r.error.code).toBe('BLOCKED_ENDPOINT');expect(f).not.toHaveBeenCalled();
 });
 it('maps statuses to typed failures and retries only transient errors with the same idempotency key',async()=>{
  const sleep=async()=>{};
  const mk=(status:number)=>vi.fn(async()=>new Response('{}',{status}));
  const adapt=(f:unknown)=>new DiffusersAdapter({remote:{endpoint:{baseUrl:'https://gpu.example.com',source:'env'},allowedHosts:['gpu.example.com'],nodeEnv:'production',fetchImpl:f as typeof fetch,lookup,sleep}});
  const f401=mk(401),f422=mk(422),f503=mk(503);
  expect((await adapt(f401).generateMotif(motif)as {error:{code:string}}).error.code).toBe('INVALID_CONFIG');
  expect((await adapt(f422).generateMotif(motif)as {error:{code:string}}).error.code).toBe('DECLINED');
  const r=await adapt(f503).generateMotif(motif);expect(!r.ok&&r.error.code).toBe('UNAVAILABLE');expect(!r.ok&&r.error.retryable).toBe(true);
  expect(f401).toHaveBeenCalledTimes(1);expect(f422).toHaveBeenCalledTimes(1);expect(f503).toHaveBeenCalledTimes(2);
  const keys=f503.mock.calls.map(c=>((c as unknown as [URL,RequestInit])[1].headers as Record<string,string>)['idempotency-key']);expect(new Set(keys).size).toBe(1);
 });
 it('rejects invalid remote payloads (missing licence, bad magic bytes, non-JSON) and never leaks the token',async()=>{
  const cases=[okBody({modelLicense:undefined}),okBody({imageBase64:Buffer.from('not an image at all').toString('base64')}),okBody({mimeType:'image/svg+xml'}),'<html>'];
  for(const body of cases){const r=await make(async()=>new Response(body)).generateMotif(motif);expect(!r.ok&&r.error.code,body.slice(0,30)).toBe('INVALID_RESPONSE');expect(JSON.stringify(r)).not.toContain('tok-secret')}
 });
 it('remote cost estimate requires configured per-image cost',()=>{
  expect(make(vi.fn()).estimateCost({prompt:'x'}).ok).toBe(true);
  const r=getDiffusersProvider({env:{NODE_ENV:'production',DIFFUSERS_API_URL:'https://gpu.example.com'}}).estimateCost({prompt:'x'});expect(!r.ok&&r.error.code).toBe('INVALID_CONFIG');
 });
});
describe('asset store',()=>{
 it('is content-addressed and metadata-only without a directory',async()=>{
  const out={sha256:'ab'.repeat(32),mimeType:'image/svg+xml',bytes:Buffer.from('x')} as never;
  expect(storageKeyFor(out)).toBe(`generated/${'ab'.repeat(32)}.svg`);
  const s=createAssetStore('');expect(s.persistent).toBe(false);expect((await s.put(out)).persisted).toBe(false);
 });
});
