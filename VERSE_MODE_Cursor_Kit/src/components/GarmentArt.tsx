import type { DemoProduct } from "@/lib/catalog";
const palettes: Record<string, [string,string]> = {
 "charcoal": ["#242629", "#f1f2ef"], "sand": ["#ddd4bc", "#282521"], "slate": ["#46505a", "#f1f2ec"],
 "muted-lilac": ["#ac9cc6", "#1e1d29"], "olive": ["#68735d", "#f5f0df"], "clay": ["#b96952", "#fff5ea"]
};
export function GarmentArt({ product, large = false }: {product: DemoProduct; large?: boolean}) {
 const [cloth,ink] = palettes[product.palette] ?? palettes.charcoal;
 const isTee = product.category === "tees";
 const name = `Concept visualization of ${product.name}`;
 return <svg className={`garment-svg ${large ? "large": ""}`} role="img" aria-label={name} viewBox="0 0 500 530" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id={`shadow-${product.slug}`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="12" floodOpacity=".16" /></filter></defs>
  <ellipse cx="250" cy="480" rx="143" ry="16" fill="#000" opacity=".12" />
  {isTee ? <g filter={`url(#shadow-${product.slug})`}><path d="M172 70 L211 55 Q250 84 289 55 L327 70 409 140 368 225 331 204 331 458 Q250 477 169 458 L169 204 132 225 91 140 Z" fill={cloth} stroke="#222" strokeOpacity=".25" strokeWidth="2"/><path d="M212 59 Q250 111 288 59" fill="none" stroke={ink} strokeOpacity=".3" strokeWidth="3"/><path d="M169 205 L169 455 M331 205 L331 455" stroke={ink} strokeOpacity=".1" strokeWidth="3"/></g>
  : <g filter={`url(#shadow-${product.slug})`}><path d="M157 68 Q252 55 342 69 L358 215 315 469 254 469 248 221 234 469 173 469 142 215 Z" fill={cloth} stroke="#222" strokeOpacity=".25" strokeWidth="2"/><path d="M156 81 Q250 91 343 81 M249 90 L247 223" fill="none" stroke={ink} strokeOpacity=".25" strokeWidth="3"/><path d="M178 450 L234 450 M257 450 L308 450" stroke={ink} strokeWidth="5" strokeOpacity=".28"/></g>}
  <g fill={ink} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900">
    {isTee ? <><text x="250" y="262" fontSize="25">{product.slug === 'offline-not-absent' ? 'OFFLINE' : product.slug === 'less-proving' ? 'LESS PROVING.' : product.slug === 'quiet-is-a-power-move' ? 'QUIET IS A' : 'REAL FRIENDS'}</text><text x="250" y="294" fontSize="25">{product.slug === 'offline-not-absent' ? '≠ ABSENT' : product.slug === 'less-proving' ? 'MORE BECOMING.' : product.slug === 'quiet-is-a-power-move' ? 'POWER MOVE.' : 'QUESTION.'}</text></>
    : <g transform="translate(297 270) rotate(-90)"><text fontSize="17">{product.slug === 'train-the-habit' ? 'TRAIN THE HABIT.' : 'PROGRESS IS PERSONAL.'}</text></g>}
  </g>
  <text x="250" y="510" textAnchor="middle" fontSize="12" fill="#555" letterSpacing="2">DIGITAL CONCEPT • NOT PHYSICAL STOCK</text>
 </svg>;
}
