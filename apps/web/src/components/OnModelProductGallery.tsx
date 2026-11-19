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
          unoptimized={current.src.includes("/api/catalog/on-model/")}
        />
        <span className="editorial-watermark editorial-watermark-compact">
          {isPhotoSample ? PHOTO_SAMPLE_WATERMARK : "Digital preview · final garment confirmed before payment"}
        </span>
      </div>
      {disclosure && (
        <details className="pdp-disclosure-details">
          <summary>About this preview</summary>
          <p className="small-note pdp-disclosure">{disclosure}</p>
          {!isPhotoSample && <p className="small-note">{MODEL_PREVIEW_WATERMARK}</p>}
        </details>
      )}
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
            <Image
              src={asset.src}
              alt={asset.alt}
              fill
              sizes="120px"
              unoptimized={asset.src.includes("/api/catalog/on-model/")}
            />
            <span>{asset.view.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}