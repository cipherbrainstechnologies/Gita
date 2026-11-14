/** Currency values are always integer INR paise. Avoid JS floating point total accumulation. */
export type Line = {unitPaise:bigint;quantity:number;discountPaise:bigint;taxPaise:bigint};
export function calculateCart(lines:Line[],shippingPaise:bigint){
 if(shippingPaise<0n)throw new Error('Invalid shipping');
 let subtotal=0n,discount=0n,tax=0n;
 for(const x of lines){
  if(!Number.isSafeInteger(x.quantity)||x.quantity<1||x.unitPaise<0n||x.discountPaise<0n||x.taxPaise<0n)throw new Error('Invalid cart line');
  const gross=x.unitPaise*BigInt(x.quantity);
  if(x.discountPaise>gross)throw new Error('Discount exceeds line');
  subtotal+=gross;discount+=x.discountPaise;tax+=x.taxPaise;
 }
 return {subtotalPaise:subtotal,discountPaise:discount,taxPaise:tax,shippingPaise,totalPaise:subtotal-discount+tax+shippingPaise};
}

/** Parses a rupee string such as "1,299" or "999.50" into integer paise without floating point. Returns null when invalid. */
export function inrToPaise(input:string):bigint|null{
 const m=input.trim().replace(/,/g,'').match(/^(\d{1,9})(?:\.(\d{1,2}))?$/);
 if(!m)return null;
 return BigInt(m[1])*100n+BigInt((m[2]??'').padEnd(2,'0')||'0');
}
/** Formats integer paise (bigint or numeric string) as an INR label. Display only; never used for arithmetic. */
export function formatInr(paise:bigint|string):string{
 const v=BigInt(paise);const whole=v/100n,frac=v%100n;
 return `₹${whole.toLocaleString('en-IN')}${frac?'.'+frac.toString().padStart(2,'0'):''}`;
}
