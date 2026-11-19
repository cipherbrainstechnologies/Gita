"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useCallback, useMemo, useState} from "react";

const THEMES = ["FOCUS", "AMBITION", "DISCIPLINE", "GRATITUDE", "COURAGE", "RESET"];
const PALETTES = [
  "charcoal",
  "sand",
  "slate",
  "olive",
  "clay",
  "bone",
  "cobalt",
  "sage",
  "rust",
  "lavender",
  "muted-lilac",
];

type Props = {
  open: boolean;
  onClose: () => void;
  total: number;
};

export function ShopFilterSheet({open, onClose, total}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [theme, setTheme] = useState(sp.get("theme") ?? "");
  const [audience, setAudience] = useState(sp.get("audience") ?? "");
  const [palette, setPalette] = useState(sp.get("palette") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");

  const apply = useCallback(() => {
    const p = new URLSearchParams(sp.toString());
    const setOrDel = (key: string, val: string) => {
      if (val) p.set(key, val);
      else p.delete(key);
    };
    setOrDel("theme", theme);
    setOrDel("audience", audience);
    setOrDel("palette", palette);
    setOrDel("category", category);
    p.delete("page");
    router.push(`/shop?${p.toString()}`);
    onClose();
  }, [audience, category, onClose, palette, router, sp, theme]);

  const clear = useCallback(() => {
    setTheme("");
    setAudience("");
    setPalette("");
    setCategory("");
    router.push("/shop");
    onClose();
  }, [onClose, router]);

  const activeCount = useMemo(
    () => [theme, audience, palette, category].filter(Boolean).length,
    [audience, category, palette, theme],
  );

  if (!open) return null;

  return (
    <div className="shop-sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="shop-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filter shop"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shop-sheet-head">
          <strong>Filter</strong>
          <span>{total} styles</span>
          <button type="button" className="shop-sheet-close" onClick={onClose} aria-label="Close filters">
            ✕
          </button>
        </header>
        <div className="shop-sheet-body">
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All apparel</option>
              <option value="tees">T-shirts</option>
              <option value="pants">Track pants & joggers</option>
            </select>
          </label>
          <label>
            Theme
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="">Any theme</option>
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Colour family
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              <option value="">Any colour</option>
              {PALETTES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fit audience
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="">All</option>
              <option value="ADULT_UNISEX">Unisex</option>
              <option value="ADULT_MEN">Men</option>
              <option value="ADULT_WOMEN">Women</option>
            </select>
          </label>
        </div>
        <footer className="shop-sheet-foot">
          <button type="button" className="button-outline" onClick={clear}>
            Clear {activeCount ? `(${activeCount})` : ""}
          </button>
          <button type="button" className="primary-cta" onClick={apply}>
            Apply
          </button>
        </footer>
      </div>
    </div>
  );
}