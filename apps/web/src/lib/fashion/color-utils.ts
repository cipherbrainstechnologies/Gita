export function hexToRgb(hex: string): {r: number; g: number; b: number} {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return {r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255};
}