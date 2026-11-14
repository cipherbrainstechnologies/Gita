'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {adminFetch, describeFailure} from '@/components/admin/adminFetch';
import {StatusChip} from '@/components/admin/StatusChip';
import type {IntegrationDto, TestResult} from '@/modules/admin/integrations/integrations.service';

const providers=['RAZORPAY','SHIPROCKET','WHATSAPP','SMS','EMAIL','AI_RENDER'] as const;
const HINTS:Record<string,string>={
 RAZORPAY:'{"keyId":"rzp_test_…","keySecret":"…","webhookSecret":"…"}',
 AI_RENDER:'https://gpu.example.com  or  {"url":"https://…","token":"…"}'
};
const TONE:Record<string,string>={NOT_CONFIGURED:'WARN',SANDBOX:'SAMPLE_APPROVED',LIVE_VERIFIED:'OK',FAILED:'BAD'};
const tonedStatus=(s:string|null)=>s?<StatusChip status={TONE[s]??'WARN'} label={s.replace(/_/g,' ')}/>:<small>never tested</small>;

export default function IntegrationControls({integrations=[]}:{integrations?:IntegrationDto[]}){
 const router=useRouter();
 const [provider,setProvider]=useState<string>('RAZORPAY');const [mode,setMode]=useState('SANDBOX');const [secret,setSecret]=useState('');const [result,setResult]=useState('');const [saving,setSaving]=useState(false);
 const [testing,setTesting]=useState<string|null>(null);const [tests,setTests]=useState<Record<string,TestResult>>({});const [testErr,setTestErr]=useState('');
 async function save(){setSaving(true);try{const r=await fetch('/api/admin/integrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider,secret,mode})});const j=await r.json();setResult(r.ok?`Encrypted in database: ${j.provider} / ${j.masked}. Connection NOT yet tested.`:`Error: ${j.error??'unknown'}`);if(r.ok){setSecret('');router.refresh()}}catch{setResult('Connection error; no save claimed.')}finally{setSaving(false)}}
 async function test(p:string){setTesting(p);setTestErr('');const r=await adminFetch<TestResult>('POST','/api/admin/integrations/test',{provider:p});if(r.ok){setTests(t=>({...t,[p]:r.data}));router.refresh()}else setTestErr(describeFailure(r));setTesting(null)}
 const stored=new Set(integrations.map(i=>i.provider));
 return <div>
  <h2 className="admin-h2">Stored providers</h2>
  <div className="admin-scroll"><table className="admin-table"><thead><tr><th>PROVIDER</th><th>ENV</th><th>SECRET</th><th>LAST TEST</th><th/></tr></thead><tbody>
   {providers.map(p=>{const row=integrations.find(i=>i.provider===p);const t=tests[p];return <tr key={p}>
    <td><b>{p}</b></td><td>{row?.mode??'—'}</td><td>{row?.maskedSuffix??'not configured'}</td>
    <td>{t?<><StatusChip status={TONE[t.status]??'WARN'} label={t.status.replace(/_/g,' ')}/><br/><small>{t.message}</small></>:row?<>{tonedStatus(row.lastTestStatus)}{row.lastTestAt&&<><br/><small>{row.lastTestAt.slice(0,16).replace('T',' ')} UTC</small></>}</>:<StatusChip status="WARN" label="NOT CONFIGURED"/>}</td>
    <td><button type="button" className="button-outline small" disabled={testing!==null||(!stored.has(p)&&p!=='AI_RENDER')} onClick={()=>test(p)}>{testing===p?'TESTING…':'TEST CONNECTION'}</button></td></tr>})}
  </tbody></table></div>
  {testErr&&<output className="admin-error" role="alert">{testErr}</output>}
  <p className="notice">A test reports <b>NOT CONFIGURED</b> when nothing is stored, <b>SANDBOX</b> for test-mode credentials, <b>LIVE VERIFIED</b> only after a real provider call succeeds, and <b>FAILED</b> otherwise (including providers that have no connection test yet). Saving a secret never counts as verification.</p>

  <h2 className="admin-h2">Save credentials</h2>
  <div className="studio-form"><label>Provider<select value={provider} onChange={e=>setProvider(e.target.value)}>{providers.map(p=><option key={p}>{p}</option>)}</select></label><label>Environment<select value={mode} onChange={e=>setMode(e.target.value)}><option>SANDBOX</option><option>LIVE</option></select></label><label>Secret payload (provisioned merchant account required)<input type="password" autoComplete="new-password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder={HINTS[provider]??'Enter provider-specific credential'}/></label><button className="primary-cta button" disabled={saving||secret.length<8} onClick={save}>{saving?'SECURING...':'SAVE ENCRYPTED CONFIG ↗'}</button><p className="notice">Secrets are encrypted server side before storage and only a masked suffix is ever shown. Expected payloads: Razorpay = JSON with keyId and keySecret; AI_RENDER = GPU service URL or JSON with url and token. Other providers store an opaque secret and have no connection test yet. Saving resets the last test result. Never put secrets into a client-visible configuration export.</p><output aria-live="polite">{result}</output></div>
 </div>}

