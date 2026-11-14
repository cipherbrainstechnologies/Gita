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
