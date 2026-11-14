import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {fail,ok,type Env,type CreateOrderInput,type CreatedOrder,type HeaderBag,type PaymentGateway,type ProviderPayment,type ReconciliationInput,type ReconciliationResult,type RefundInput,type RefundResult,type Result,type VerifiedWebhook} from '../types';
/**
 * Razorpay adapter. Order creation is payment INITIATION only; it never confirms payment.
 * Capture must come from a signature-verified webhook persisted by the durable inbox (not implemented here).
 * Without keys every call returns INVALID_CONFIG; nothing is simulated as a successful live payment.
 */
export interface RazorpayConfig{keyId?:string;keySecret?:string;webhookSecret?:string;fetchImpl?:typeof fetch;timeoutMs?:number}
const API='https://api.razorpay.com/v1';
const orderInput=z.object({orderId:z.string().min(1).max(64),amountPaise:z.number().int().positive().max(10_000_000_00),currency:z.literal('INR'),receipt:z.string().min(1).max(40)});
const orderResponse=z.object({id:z.string().min(1).max(64),amount:z.number().int(),currency:z.string(),status:z.string()});
export function razorpayConfigFromEnv(env:Env=process.env):RazorpayConfig{return {keyId:env.RAZORPAY_KEY_ID||undefined,keySecret:env.RAZORPAY_KEY_SECRET||undefined,webhookSecret:env.RAZORPAY_WEBHOOK_SECRET||undefined}}
function header(h:HeaderBag,name:string):string|null{
 if(typeof Headers!=='undefined'&&h instanceof Headers)return h.get(name);
 const rec=h as Record<string,string|string[]|undefined>;
 for(const k of Object.keys(rec))if(k.toLowerCase()===name){const v=rec[k];return Array.isArray(v)?(v[0]??null):(v??null)}
 return null;
}
/** HMAC-SHA256 (hex) over the raw body with the webhook secret, compared in constant time. */
export function verifyRazorpaySignature(rawBody:string|Buffer,signature:string|null,secret:string):boolean{
 if(!signature||!/^[0-9a-fA-F]{64}$/.test(signature))return false;
 const expected=createHmac('sha256',secret).update(rawBody).digest();
 return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
export class RazorpayAdapter implements PaymentGateway{
 readonly id='razorpay';readonly configured:boolean;
 constructor(private readonly cfg:RazorpayConfig={}){this.configured=Boolean(cfg.keyId&&cfg.keySecret)}
 private mode():'TEST'|'LIVE'|null{const k=this.cfg.keyId??'';return k.startsWith('rzp_live_')?'LIVE':k.startsWith('rzp_test_')?'TEST':null}
 async createOrder(input:CreateOrderInput):Promise<Result<CreatedOrder>>{
  const {keyId,keySecret}=this.cfg;
  if(!keyId||!keySecret)return fail(this.id,'INVALID_CONFIG','NOT CONFIGURED: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
  const mode=this.mode();if(!mode)return fail(this.id,'INVALID_CONFIG','RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_');
  const p=orderInput.safeParse(input);if(!p.success)return fail(this.id,'DECLINED','Invalid order request');
  const d=p.data;
  let res:Response;
  try{res=await (this.cfg.fetchImpl??fetch)(`${API}/orders`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(this.cfg.timeoutMs??15_000),headers:{'content-type':'application/json',authorization:`Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`},body:JSON.stringify({amount:d.amountPaise,currency:d.currency,receipt:d.receipt,notes:{orderId:d.orderId}})})}
  catch{return fail(this.id,'UNAVAILABLE','Razorpay unreachable or timed out')}
  if(res.status===401||res.status===403)return fail(this.id,'INVALID_CONFIG','Razorpay rejected the configured credentials');
  if(res.status===429||res.status>=500)return fail(this.id,'UNAVAILABLE',`Razorpay unavailable (HTTP ${res.status})`);
  if(!res.ok)return fail(this.id,'DECLINED',`Razorpay declined order creation (HTTP ${res.status})`);
  let json:unknown;try{json=await res.json()}catch{return fail(this.id,'UNAVAILABLE','Razorpay returned an unreadable response')}
  const o=orderResponse.safeParse(json);
  if(!o.success||o.data.amount!==d.amountPaise||o.data.currency!==d.currency)return fail(this.id,'DECLINED','Razorpay order response did not match the requested amount');
  return ok({providerOrderId:o.data.id,clientPublishableKey:keyId,mode});
 }
 verifySignedWebhook(rawBody:string|Buffer,headers:HeaderBag,configuredWebhookSecret?:string):Result<VerifiedWebhook>{
  const secret=configuredWebhookSecret||this.cfg.webhookSecret;
  if(!secret)return fail(this.id,'INVALID_CONFIG','NOT CONFIGURED: RAZORPAY_WEBHOOK_SECRET is required');
  if(!verifyRazorpaySignature(rawBody,header(headers,'x-razorpay-signature'),secret))return fail(this.id,'INVALID_SIGNATURE','Webhook signature missing or invalid');
  let eventType:string|null=null;
  try{const j=JSON.parse(Buffer.isBuffer(rawBody)?rawBody.toString('utf8'):rawBody) as {event?:unknown};eventType=typeof j.event==='string'?j.event:null}catch{return fail(this.id,'DECLINED','Verified webhook body is not valid JSON')}
  return ok({eventId:header(headers,'x-razorpay-event-id'),eventType,payloadSha256:createHash('sha256').update(rawBody).digest('hex')});
 }
 // Stubs: not implemented on purpose until the capture/settlement state machine and dual-approval refund flow exist.
 private stub<T>(op:string):Result<T>{return this.configured?fail(this.id,'UNAVAILABLE',`${op} is not implemented; requires reconciled state machine`):fail(this.id,'INVALID_CONFIG','NOT CONFIGURED: Razorpay keys missing')}
 async fetchPaymentById(paymentId:string):Promise<Result<ProviderPayment>>{void paymentId;return this.stub('fetchPaymentById')}
 async refund(input:RefundInput):Promise<Result<RefundResult>>{void input;return this.stub('refund')}
 async verifyReconciliation(input:ReconciliationInput):Promise<Result<ReconciliationResult>>{void input;return this.stub('verifyReconciliation')}
}
