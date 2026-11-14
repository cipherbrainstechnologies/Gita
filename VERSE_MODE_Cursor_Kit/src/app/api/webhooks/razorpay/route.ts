import {NextResponse} from 'next/server';
/**
 * NOT LIVE. Cursor must implement raw-body HMAC using credential vault,
 * durable webhook inbox, idempotency, verified capture/settlement state machine,
 * and real payment reconciliation before enabling payments.
 * Always fail closed instead of acknowledging an event you did not persist.
 */
export async function POST(){return NextResponse.json({error:'Razorpay webhook is not configured; merchant onboarding and signed-event verification required'},{status:503})}
