'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {ConceptMedia} from '@/lib/catalog';
export function EditorialGallery({images,productName}:{images:ConceptMedia[],productName:string}){
  const [active,setActive]=useState(0);
  const current=images[active] ?? images[0];
  if(!current)return null;
  return <div className="editorial-gallery">
    <div className="editorial-primary">
      <Image key={current.src} src={current.src} alt={current.alt} fill sizes="(max-width: 900px) 100vw, 55vw" priority className="editorial-photo"/>
      <span className="editorial-watermark">AI CONCEPT — NOT A PHYSICAL SAMPLE</span>
    </div>
    <div className="editorial-thumbs" role="group" aria-label={`${productName} image views`}>
      {images.map((asset,index)=><button type="button" onClick={()=>setActive(index)} aria-label={`Show ${asset.view} view`} aria-pressed={index===active} className={`editorial-thumb ${index===active?'chosen':''}`} key={`${asset.view}-${asset.src}`}>
        <Image src={asset.src} alt={asset.alt} fill sizes="120px"/>
        <span>{asset.view.toUpperCase()}</span>
      </button>)}
    </div>
  </div>;
}
