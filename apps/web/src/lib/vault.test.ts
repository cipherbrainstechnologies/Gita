import {describe,it,expect,afterEach} from 'vitest';
import {encryptSecret,decryptSecret} from './vault';
const old=process.env.INTEGRATION_MASTER_KEY;
afterEach(()=>{if(old===undefined)delete process.env.INTEGRATION_MASTER_KEY;else process.env.INTEGRATION_MASTER_KEY=old});
describe('provider secret vault',()=>{
 it('never stores plaintext and enforces provider scope',()=>{
  process.env.INTEGRATION_MASTER_KEY=Buffer.alloc(32,7).toString('base64');
  const e=encryptSecret('very-secret-provider-key','RAZORPAY');
  expect(e.payload).not.toContain('very-secret');
  expect(decryptSecret(e,'RAZORPAY')).toBe('very-secret-provider-key');
  expect(()=>decryptSecret(e,'SHIPROCKET')).toThrow();
 });
 it('fails closed when no key is set',()=>{delete process.env.INTEGRATION_MASTER_KEY;expect(()=>encryptSecret('abc','AI_RENDER')).toThrow()});
});
