import {describe,it,expect} from 'vitest';
import {assertAllowedUrl,assertResolvedPublic,isPrivateAddress,parseAllowlist,SsrfError} from './ssrf';
const prod={allowedHosts:['gpu.example.com','*.render.example.org'],nodeEnv:'production'};
describe('SSRF allowlist',()=>{
 it('accepts allowlisted https hosts, exact and wildcard',()=>{
  expect(assertAllowedUrl('https://gpu.example.com/base',prod).hostname).toBe('gpu.example.com');
  expect(assertAllowedUrl('https://a.render.example.org',prod).hostname).toBe('a.render.example.org');
 });
 it('rejects hosts outside the allowlist, incl. suffix tricks',()=>{
  for(const u of ['https://evil.com','https://gpu.example.com.evil.com','https://render.example.org','https://notgpu.example.com'])expect(()=>assertAllowedUrl(u,prod),u).toThrow(SsrfError);
 });
 it('rejects everything when the allowlist is empty',()=>{expect(()=>assertAllowedUrl('https://gpu.example.com',{allowedHosts:[],nodeEnv:'production'})).toThrow(SsrfError)});
 it('rejects http, embedded credentials and malformed URLs outside development',()=>{
  expect(()=>assertAllowedUrl('http://gpu.example.com',prod)).toThrow(/https/);
  expect(()=>assertAllowedUrl('https://user:pw@gpu.example.com',prod)).toThrow(/credentials/);
  expect(()=>assertAllowedUrl('not a url',prod)).toThrow(SsrfError);
 });
 it('blocks private literals and internal names in production even when allowlisted',()=>{
  const all=['127.0.0.1','10.0.0.5','169.254.169.254','192.168.1.1','172.16.0.1','[::1]','[fd00::1]','[::ffff:127.0.0.1]','localhost','svc.internal'];
  for(const h of all)expect(()=>assertAllowedUrl(`https://${h}/`,{allowedHosts:[h.replace(/^\[|\]$/g,'')],nodeEnv:'production'}),h).toThrow(SsrfError);
  expect(()=>assertAllowedUrl('https://2130706433/',{allowedHosts:['127.0.0.1'],nodeEnv:'production'})).toThrow(SsrfError); // decimal form normalises to 127.0.0.1
 });
 it('treats an unset NODE_ENV as production',()=>{expect(()=>assertAllowedUrl('https://127.0.0.1',{allowedHosts:['127.0.0.1']})).toThrow(SsrfError)});
 it('allows private hosts and http only in development (allowlist still enforced)',()=>{
  const dev={allowedHosts:['localhost','127.0.0.1'],nodeEnv:'development'};
  expect(assertAllowedUrl('http://localhost:8000',dev).port).toBe('8000');
  expect(assertAllowedUrl('http://127.0.0.1:8000',dev).hostname).toBe('127.0.0.1');
  expect(()=>assertAllowedUrl('http://other.local',dev)).toThrow(SsrfError);
 });
 it('classifies addresses',()=>{
  for(const ip of ['0.0.0.0','100.64.0.1','172.31.255.255','198.18.0.1','224.0.0.1','::','::1','fe80::1','fc00::1','ff02::1','::ffff:10.0.0.1','64:ff9b::7f00:1','2001:db8::1','garbage'])expect(isPrivateAddress(ip),ip).toBe(true);
  for(const ip of ['8.8.8.8','172.32.0.1','1.1.1.1','2606:4700:4700::1111','::ffff:8.8.8.8'])expect(isPrivateAddress(ip),ip).toBe(false);
 });
 it('parses allowlist env',()=>{expect(parseAllowlist(' A.com, *.b.org ,,')).toEqual(['a.com','*.b.org']);expect(parseAllowlist(undefined)).toEqual([])});
});
describe('DNS rebinding guard',()=>{
 const url=new URL('https://gpu.example.com');
 it('rejects hosts resolving to private addresses (any record)',async()=>{
  await expect(assertResolvedPublic(url,prod,async()=>[{address:'8.8.8.8'},{address:'10.0.0.2'}])).rejects.toThrow(SsrfError);
  await expect(assertResolvedPublic(url,prod,async()=>[])).rejects.toThrow(SsrfError);
  await expect(assertResolvedPublic(url,prod,async()=>{throw new Error('ENOTFOUND')})).rejects.toThrow(SsrfError);
 });
 it('accepts public resolution and skips lookup in development',async()=>{
  await expect(assertResolvedPublic(url,prod,async()=>[{address:'93.184.216.34'}])).resolves.toBeUndefined();
  await expect(assertResolvedPublic(url,{...prod,nodeEnv:'development'},async()=>{throw new Error('should not resolve')})).resolves.toBeUndefined();
 });
});
