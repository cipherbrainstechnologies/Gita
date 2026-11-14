import type {Env,PaymentGateway} from '../types';
import {RazorpayAdapter,razorpayConfigFromEnv,type RazorpayConfig} from './razorpayAdapter';
/** No sandbox success path for payments: an unconfigured gateway reports `configured:false` and fails every call with INVALID_CONFIG. */
export function getPaymentGateway(o:{env?:Env;config?:RazorpayConfig}={}):PaymentGateway{return new RazorpayAdapter(o.config??razorpayConfigFromEnv(o.env))}
export {RazorpayAdapter,razorpayConfigFromEnv,verifyRazorpaySignature} from './razorpayAdapter';
