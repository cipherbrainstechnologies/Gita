"use client";
import {useState} from "react";
import Image from "next/image";
import type {ResolvedMedia} from "@/lib/catalog-media";
import {MODEL_PREVIEW_WATERMARK, PHOTO_SAMPLE_WATERMARK} from "@/lib/storefront-copy";

type Props = {
  images: ResolvedMedia[];
  productName: string;
  disclosure?: string;
};

export function OnModelProductGallery({images, productName, disclosure}: Props) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  if (!current) return null;
  const isPhotoSample = current.origin === "PHOTOGRAPHED_SAMPLE";
  return (
    <div className="editorial-gallery on-model-gallery">
      <div className="editorial-primary">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 900px) 100vw, 55vw"
          priority
          className="editorial-photo"
        />
        <span className="editorial-watermark">
          {isPhotoSample ? PHOTO_SAMPLE_WATERMARK : MODEL_PREVIEW_WATERMARK}
        </span>
      </div>
      {disclosure && <p className="small-note pdp-disclosure">{disclosure}</p>}
      <div className="editorial-thumbs" role="group" aria-label={`${productName} image views`}>
        {images.map((asset, index) => (
          <button
            type="button"
            key={`${asset.view}-${asset.src}`}
            onClick={() => setActive(index)}
            aria-label={`Show ${asset.view} view`}
            aria-pressed={index === active}
            className={`editorial-thumb ${index === active ? "chosen" : ""}`}
          >
            <Image src={asset.src} alt={asset.alt} fill sizes="120px" />
            <span>{asset.view.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}