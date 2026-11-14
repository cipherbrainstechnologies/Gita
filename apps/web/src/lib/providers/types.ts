import {z} from 'zod';
/** Provider adapter boundary types (docs/engineering/PROVIDER_ADAPTER_SPECS.md). Failures are values, never thrown across the boundary. */
export type ProviderFailureCode='INVALID_CONFIG'|'UNAVAILABLE'|'DECLINED'|'MISSING_CAPTURE'|'INVALID_SIGNATURE'|'INVALID_RESPONSE'|'BLOCKED_ENDPOINT'|'BUDGET_EXCEEDED'|'UNSUPPORTED';
export interface ProviderFailure{code:ProviderFailureCode;message:string;retryable:boolean;provider:string}
export type Result<T>={ok:true;value:T}|{ok:false;error:ProviderFailure};
export type Env=Record<string,string|undefined>;
export const ok=<T>(value:T):Result<T>=>({ok:true,value});
const RETRYABLE=new Set<ProviderFailureCode>(['UNAVAILABLE']);
export const fail=(provider:string,code:ProviderFailureCode,message:string):{ok:false;error:ProviderFailure}=>({ok:false,error:{provider,code,message,retryable:RETRYABLE.has(code)}});

// ---------- Graphic ----------
export type GraphicKind='MOTIF'|'FLAT_MOCKUP'|'LIFESTYLE_SIMULATION';
export type GraphicMode='REMOTE'|'SANDBOX';
/** NOT_CONFIGURED/INVALID_CONFIG adapters still emit labelled sandbox simulations; only REMOTE calls an external GPU service. */
export type GraphicStatus='REMOTE'|'NOT_CONFIGURED'|'INVALID_CONFIG';
export interface GraphicProvenance{provider:string;mode:GraphicMode;kind:GraphicKind;isSimulation:boolean;seed:string;idempotencyKey:string;modelName:string;modelVersion:string;modelLicense:string;outputLicense:string;promptVersion?:string;requestId?:string;costInr?:number;notice?:string;configIssue?:string}
export interface GraphicOutput{kind:GraphicKind;bytes:Buffer;mimeType:string;sha256:string;isSimulation:boolean;provenance:GraphicProvenance}
export interface CostEstimate{amountInr:number;currency:'INR';isSimulation:boolean;basis:string}

const id=z.string().min(1).max(128);
export const costInputSchema=z.object({prompt:z.string().min(1).max(2000),motif:z.string().max(200).optional(),modelVersion:z.string().max(100).optional()});
export const motifInputSchema=z.object({seed:id,prompt:z.string().min(1).max(2000),motif:z.string().max(200).optional(),palette:z.string().min(1).max(200),placement:z.string().min(1).max(100),licensedCheckpoint:z.string().min(1).max(200),modelVersion:z.string().max(100).optional(),promptVersion:z.string().max(60).optional(),idempotencyKey:id});
export const flatMockupInputSchema=z.object({seed:id,garmentFamily:z.string().min(1).max(60),colour:z.string().max(40).optional(),placement:z.string().min(1).max(100),artworkBase64:z.string().max(14_000_000).optional(),artworkMimeType:z.enum(['image/png','image/jpeg','image/webp','image/svg+xml']).optional(),licensedCheckpoint:z.string().min(1).max(200),modelVersion:z.string().max(100).optional(),promptVersion:z.string().max(60).optional(),idempotencyKey:id});
export const lifestyleInputSchema=z.object({seed:id,category:z.enum(['tops','bottoms','one-pieces']),garmentImageBase64:z.string().max(14_000_000).optional(),garmentMimeType:z.enum(['image/png','image/jpeg','image/webp']).optional(),personImageBase64:z.string().max(14_000_000).optional(),personMimeType:z.enum(['image/png','image/jpeg','image/webp']).optional(),licensedCheckpoint:z.string().min(1).max(200),idempotencyKey:id});
export type CostInput=z.infer<typeof costInputSchema>;
export type MotifInput=z.infer<typeof motifInputSchema>;
export type FlatMockupInput=z.infer<typeof flatMockupInputSchema>;
export type LifestyleInput=z.infer<typeof lifestyleInputSchema>;
export interface GraphicProvider{
 readonly id:string;readonly status:GraphicStatus;readonly configIssue?:string;
 estimateCost(input:CostInput):Result<CostEstimate>;
 generateMotif(input:MotifInput):Promise<Result<GraphicOutput>>;
 generateFlatMockup(input:FlatMockupInput):Promise<Result<GraphicOutput>>;
 generateLifestyleSimulation(input:LifestyleInput):Promise<Result<GraphicOutput>>;
}

// ---------- Payments ----------
export type HeaderBag=Headers|Record<string,string|string[]|undefined>;
export interface CreateOrderInput{orderId:string;amountPaise:number;currency:'INR';receipt:string}
export interface CreatedOrder{providerOrderId:string;clientPublishableKey:string;mode:'TEST'|'LIVE'}
export interface VerifiedWebhook{eventId:string|null;eventType:string|null;payloadSha256:string}
export interface ProviderPayment{providerPaymentId:string;providerOrderId:string|null;status:string;amountPaise:number;captured:boolean}
export interface RefundInput{paymentId:string;amountPaise:number;idempotencyKey:string}
export interface RefundResult{providerRefundId:string;status:string}
export interface ReconciliationInput{providerPaymentId:string;expectedAmountPaise:number}
export interface ReconciliationResult{matched:boolean;captured:boolean}
export interface PaymentGateway{
 readonly id:string;readonly configured:boolean;
 createOrder(input:CreateOrderInput):Promise<Result<CreatedOrder>>;
 /** Raw body must be the unparsed request bytes. Never re-serialise parsed JSON. */
 verifySignedWebhook(rawBody:string|Buffer,headers:HeaderBag,configuredWebhookSecret?:string):Result<VerifiedWebhook>;
 fetchPaymentById(paymentId:string):Promise<Result<ProviderPayment>>;
 refund(input:RefundInput):Promise<Result<RefundResult>>;
 verifyReconciliation(input:ReconciliationInput):Promise<Result<ReconciliationResult>>;
}
