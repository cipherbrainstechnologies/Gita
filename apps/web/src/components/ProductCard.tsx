import Link from "next/link";
import {GarmentArt} from "@/components/GarmentArt";
import type {CatalogProduct} from "@/lib/catalog";
export function ProductCard({product}: {product: CatalogProduct}){
 const chip=product.orderable?"PREORDER":product.status==="CONCEPT"?"DIGITAL CONCEPT":product.status.replace(/_/g," ");
 return <Link href={`/shop/${product.slug}`} className="product-card"><div className="product-image"><div className="chip">{chip}</div><GarmentArt product={product}/></div><div className="product-meta"><div><div className="eyebrow">{product.collection}</div><h3>{product.name}</h3><p>{product.fit}</p></div>{product.priceInr!==null&&<span className="price">₹{product.priceInr.toLocaleString("en-IN")}<small>{product.orderable?" / preorder":" / proposed"}</small></span>}</div></Link>
}

