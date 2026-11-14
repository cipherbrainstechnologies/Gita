export type DemoProduct = {
  slug: string; name: string; collection: string; category: "tees" | "pants"; line: string;
  palette: string; priceInr: number; fit: string; sizes: string[]; approved: false;
};
/** Editorial previews only. No garment physically exists and there is NO checkout for these examples. */
export const sampleConcepts: DemoProduct[] = [
  { slug: "quiet-is-a-power-move", name: "Quiet Power Oversized Tee", collection: "STATIC / NOISE", category: "tees", line: "QUIET IS A POWER MOVE.", palette: "charcoal", priceInr: 999, fit: "Oversized concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "less-proving", name: "Less Proving Relaxed Tee", collection: "UNFINISHED", category: "tees", line: "LESS PROVING. MORE BECOMING.", palette: "sand", priceInr: 1099, fit: "Relaxed concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "train-the-habit", name: "Train The Habit Track Pant", collection: "MOTION > MOTIVATION", category: "pants", line: "TRAIN THE HABIT / NOT THE HIGHLIGHT", palette: "slate", priceInr: 1499, fit: "Straight concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "real-friends-question", name: "Honest Friend Tee", collection: "FRENEMY?", category: "tees", line: "REAL FRIENDS QUESTION THE SCRIPT.", palette: "muted-lilac", priceInr: 999, fit: "Boxy concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "progress-is-personal", name: "Progress Is Personal Track Pant", collection: "RESET", category: "pants", line: "PROGRESS IS PERSONAL.", palette: "olive", priceInr: 1399, fit: "Tapered concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false },
  { slug: "offline-not-absent", name: "Offline Not Absent Tee", collection: "AFTER CLASS", category: "tees", line: "OFFLINE ≠ ABSENT.", palette: "clay", priceInr: 899, fit: "Standard concept", sizes: ["XS", "S", "M", "L", "XL", "XXL"], approved: false }
];
