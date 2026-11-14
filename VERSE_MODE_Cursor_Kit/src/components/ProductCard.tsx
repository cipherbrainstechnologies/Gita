import Link from "next/link";
import {GarmentArt} from "@/components/GarmentArt";
import type {DemoProduct} from "@/lib/catalog";
export function ProductCard({product}: {product: DemoProduct}){return <Link href={`/shop/${product.slug}`} className="product-card"><div className="product-image"><div className="chip">DIGITAL CONCEPT</div><GarmentArt product={product}/></div><div className="product-meta"><div><div className="eyebrow">{product.collection}</div><h3>{product.name}</h3><p>{product.fit}</p></div><span className="price">₹{product.priceInr.toLocaleString('en-IN')}<small> / proposed</small></span></div></Link>}
