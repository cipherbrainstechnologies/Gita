import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
/** DB encrypted provider configuration. Never expose master key to browser or save it to DB. */
function master():Buffer{
 const raw=process.env.INTEGRATION_MASTER_KEY;
 if(!raw)throw new Error('INTEGRATION_MASTER_KEY is required');
 const key=Buffer.from(raw,'base64');
 if(key.length!==32)throw new Error('INTEGRATION_MASTER_KEY must decode to exactly 32 bytes');
 return key;
}
export function encryptSecret(plain:string, provider:string){
 const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',master(),iv);cipher.setAAD(Buffer.from(provider));
 const encrypted=Buffer.concat([cipher.update(plain,'utf8'),cipher.final()]);
 return {payload:encrypted.toString('base64'),nonce:iv.toString('base64'),authTag:cipher.getAuthTag().toString('base64'),keyVersion:1};
}
export function decryptSecret(blob:{payload:string,nonce:string,authTag:string},provider:string){
 const decipher=createDecipheriv('aes-256-gcm',master(),Buffer.from(blob.nonce,'base64'));
 decipher.setAAD(Buffer.from(provider));decipher.setAuthTag(Buffer.from(blob.authTag,'base64'));
 return Buffer.concat([decipher.update(Buffer.from(blob.payload,'base64')),decipher.final()]).toString('utf8');
}
export function maskedSecret(raw:string){return `••••${raw.slice(-4)}`}
