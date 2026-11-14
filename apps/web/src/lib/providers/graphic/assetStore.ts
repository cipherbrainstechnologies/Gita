import {mkdir,stat,writeFile,rename} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import type {GraphicOutput} from '../types';
/** Content-addressed asset persistence on a mounted volume (ASSET_STORAGE_DIR). Without it only metadata can be recorded. */
const EXT:Record<string,string>={'image/svg+xml':'svg','image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
export interface AssetStore{readonly persistent:boolean;put(out:GraphicOutput):Promise<{storageKey:string;persisted:boolean}>}
export const storageKeyFor=(out:Pick<GraphicOutput,'sha256'|'mimeType'>)=>`generated/${out.sha256}.${EXT[out.mimeType]??'bin'}`;
export function createAssetStore(dir?:string|null):AssetStore{
 const root=dir?.trim()||null;
 return {persistent:Boolean(root),async put(out){
  const storageKey=storageKeyFor(out);
  if(!root)return {storageKey,persisted:false};
  const target=join(root,storageKey);
  if(!await stat(target).then(()=>true,()=>false)){
   await mkdir(dirname(target),{recursive:true});
   const tmp=`${target}.${process.pid}.${Date.now()}.tmp`;
   await writeFile(tmp,out.bytes);await rename(tmp,target); // atomic; identical bytes if two workers race
  }
  return {storageKey,persisted:true};
 }};
}
