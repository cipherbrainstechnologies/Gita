import {describe,it,expect} from 'vitest';
import {calculateCart} from './money';
describe('money invariants',()=>{
 it('uses integer paise and deterministic totals',()=>expect(calculateCart([{unitPaise:99900n,quantity:2,discountPaise:10000n,taxPaise:0n}],5000n).totalPaise).toBe(194800n));
 it('rejects negative shipping',()=>expect(()=>calculateCart([], -1n)).toThrow());
 it('rejects free money via excessive discount',()=>expect(()=>calculateCart([{unitPaise:100n,quantity:1,discountPaise:101n,taxPaise:0n}],0n)).toThrow());
});
