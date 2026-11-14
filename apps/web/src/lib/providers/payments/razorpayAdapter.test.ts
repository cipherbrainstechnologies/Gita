import {describe,it,expect,vi} from 'vitest';
import {createHmac} from 'node:crypto';
import {getPaymentGateway,verifyRazorpaySignature} from './index';
import {RazorpayAdapter} from './razorpayAdapter';
const secret='whsec_test_secret_value';
const body=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'pay_1'}}}});
const sign=(b:string|Buffer,s=secret)=>createHmac('sha256',s).update(b).digest('hex');
const gw=new RazorpayAdapter({webhookSecret:secret});
describe('Razorpay webhook HMAC',()=>{
 it('accepts a correct raw-body signature (record + Headers inputs)',()=>{
  const r=gw.verifySignedWebhook(body,{'X-Razorpay-Signature':sign(body),'x-razorpay-event-id':'evt_1'});
  expect(r.ok&&r.value.eventId).toBe('evt_1');expect(r.ok&&r.value.eventType).toBe('payment.captured');expect(r.ok&&r.value.payloadSha256).toHaveLength(64);
  expect(gw.verifySignedWebhook(Buffer.from(body),new Headers({'x-razorpay-signature':sign(body)})).ok).toBe(true);
 });
 it('rejects tampered, re-serialised, wrong-secret, missing and malformed signatures',()=>{
  const sig=sign(body);
  const bad:[string,Record<string,string|undefined>][]=[
   [body+' ',{'x-razorpay-signature':sig}],
   [JSON.stringify(JSON.parse(body),null,2),{'x-razorpay-signature':sig}],
   [body,{'x-razorpay-signature':sign(body,'other')}],
   [body,{}],[body,{'x-razorpay-signature':'abc'}],[body,{'x-razorpay-signature':'z'.repeat(64)}],
  ];
  for(const [b,h] of bad){const r=gw.verifySignedWebhook(b,h);expect(r.ok).toBe(false);if(!r.ok)expect(r.error.code).toBe('INVALID_SIGNATURE')}
 });
 it('fails closed with INVALID_CONFIG when no webhook secret is configured',()=>{
  const r=new RazorpayAdapter().verifySignedWebhook(body,{'x-razorpay-signature':sign(body)});
  expect(r.ok).toBe(false);if(!r.ok)expect(r.error.code).toBe('INVALID_CONFIG');
 });
 it('prefers an explicitly passed secret and does not leak it in errors',()=>{
  expect(new RazorpayAdapter().verifySignedWebhook(body,{'x-razorpay-signature':sign(body)},secret).ok).toBe(true);
  const r=gw.verifySignedWebhook(body,{'x-razorpay-signature':sign(body,'x')});
  expect(JSON.stringify(r)).not.toContain(secret);
 });
 it('rejects verified-but-not-JSON bodies',()=>{const raw='not json';const r=gw.verifySignedWebhook(raw,{'x-razorpay-signature':sign(raw)});expect(r.ok).toBe(false);if(!r.ok)expect(r.error.code).toBe('DECLINED')});
 it('exposes the primitive',()=>{expect(verifyRazorpaySignature(body,sign(body),secret)).toBe(true);expect(verifyRazorpaySignature(body,null,secret)).toBe(false)});
});
describe('Razorpay order creation',()=>{
 const input={orderId:'ord_1',amountPaise:49900,currency:'INR' as const,receipt:'rcpt_1'};
 it('returns INVALID_CONFIG and never calls the network without keys',async()=>{
  const f=vi.fn();const r=await new RazorpayAdapter({fetchImpl:f as unknown as typeof fetch}).createOrder(input);
  expect(r.ok).toBe(false);if(!r.ok){expect(r.error.code).toBe('INVALID_CONFIG');expect(r.error.message).toMatch(/NOT CONFIGURED/)}
  expect(f).not.toHaveBeenCalled();
  expect(getPaymentGateway({env:{}}).configured).toBe(false);
 });
 it('rejects malformed key ids',async()=>{const r=await new RazorpayAdapter({keyId:'bogus',keySecret:'s'}).createOrder(input);expect(!r.ok&&r.error.code).toBe('INVALID_CONFIG')});
 it('creates an order only when Razorpay echoes the exact amount; sends Basic auth to the fixed host',async()=>{
  const f=vi.fn(async()=>new Response(JSON.stringify({id:'order_X',amount:49900,currency:'INR',status:'created'}),{status:200}));
  const a=new RazorpayAdapter({keyId:'rzp_test_abc',keySecret:'sek',fetchImpl:f as unknown as typeof fetch});
  const r=await a.createOrder(input);
  expect(r.ok&&r.value).toEqual({providerOrderId:'order_X',clientPublishableKey:'rzp_test_abc',mode:'TEST'});
  const [url,init]=f.mock.calls[0] as unknown as [string,RequestInit];
  expect(url).toBe('https://api.razorpay.com/v1/orders');expect((init.headers as Record<string,string>).authorization).toMatch(/^Basic /);
  const mismatch=new RazorpayAdapter({keyId:'rzp_live_abc',keySecret:'sek',fetchImpl:(async()=>new Response(JSON.stringify({id:'o',amount:1,currency:'INR',status:'created'})))as unknown as typeof fetch});
  expect((await mismatch.createOrder(input)).ok).toBe(false);
 });
 it('maps HTTP failures to typed codes and never echoes secrets',async()=>{
  const mk=(status:number)=>new RazorpayAdapter({keyId:'rzp_test_abc',keySecret:'topsecret',fetchImpl:(async()=>new Response('{}',{status}))as unknown as typeof fetch});
  expect((await mk(401).createOrder(input)).ok===false&&true).toBe(true);
  const codes=await Promise.all([401,400,503].map(async s=>{const r=await mk(s).createOrder(input);return !r.ok&&r.error.code}));
  expect(codes).toEqual(['INVALID_CONFIG','DECLINED','UNAVAILABLE']);
  const netFail=await new RazorpayAdapter({keyId:'rzp_test_abc',keySecret:'topsecret',fetchImpl:(async()=>{throw new Error('boom topsecret')})as unknown as typeof fetch}).createOrder(input);
  expect(JSON.stringify(netFail)).not.toContain('topsecret');expect(!netFail.ok&&netFail.error.retryable).toBe(true);
 });
 it('rejects invalid amounts before any request',async()=>{const r=await new RazorpayAdapter({keyId:'rzp_test_abc',keySecret:'s'}).createOrder({...input,amountPaise:10.5});expect(!r.ok&&r.error.code).toBe('DECLINED')});
 it('refund/fetch/reconcile are explicit stubs, never successes',async()=>{
  for(const a of [new RazorpayAdapter(),new RazorpayAdapter({keyId:'rzp_test_a',keySecret:'s'})]){
   const rs=[await a.refund({paymentId:'p',amountPaise:1,idempotencyKey:'k'}),await a.fetchPaymentById('p'),await a.verifyReconciliation({providerPaymentId:'p',expectedAmountPaise:1})];
   for(const r of rs)expect(r.ok).toBe(false);
  }
 });
});
