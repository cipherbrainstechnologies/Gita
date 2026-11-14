import {describe,it,expect} from 'vitest';
import {calculateCart,formatInr,inrToPaise} from './money';
describe('money invariants',()=>{
 it('uses integer paise and deterministic totals',()=>expect(calculateCart([{unitPaise:99900n,quantity:2,discountPaise:10000n,taxPaise:0n}],5000n).totalPaise).toBe(194800n));
 it('rejects negative shipping',()=>expect(()=>calculateCart([], -1n)).toThrow());
 it('rejects free money via excessive discount',()=>expect(()=>calculateCart([{unitPaise:100n,quantity:1,discountPaise:101n,taxPaise:0n}],0n)).toThrow());
});
describe('inr helpers',()=>{
 it('parses rupees to paise exactly',()=>{expect(inrToPaise('999')).toBe(99900n);expect(inrToPaise('1,299.5')).toBe(129950n);expect(inrToPaise('0.07')).toBe(7n)});
 it('rejects malformed rupee input',()=>{for(const s of ['','abc','-5','1.234','1e3','12.'])expect(inrToPaise(s)).toBeNull()});
 it('formats paise',()=>{expect(formatInr(99900n)).toBe('₹999');expect(formatInr('129950')).toBe('₹1,299.50')});
});

