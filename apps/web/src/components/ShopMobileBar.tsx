"use client";

import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {ShopFilterSheet} from "./ShopFilterSheet";

const SORTS = [
  {value: "featured", label: "Featured"},
  {value: "newest", label: "Newest"},
  {value: "price-asc", label: "Price ↑"},
  {value: "price-desc", label: "Price ↓"},
];

export function ShopMobileBar({total}: {total: number}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sp = useSearchParams();
  const router = useRouter();
  const sort = sp.get("sort") ?? "featured";

  function setSort(next: string) {
    const p = new URLSearchParams(sp.toString());
    if (next === "featured") p.delete("sort");
    else p.set("sort", next);
    p.delete("page");
    router.push(`/shop?${p.toString()}`);
    setSortOpen(false);
  }

  return (
    <>
      <nav className="shop-mobile-bar" aria-label="Shop controls">
        <Link href="/shop" className={!sp.get("category") ? "active" : ""}>
          Categories
        </Link>
        <button type="button" onClick={() => setFiltersOpen(true)}>
          Filter
        </button>
        <button type="button" onClick={() => setSortOpen((v) => !v)} aria-expanded={sortOpen}>
          Sort
        </button>
      </nav>
      {sortOpen && (
        <div className="shop-sort-popover" role="listbox" aria-label="Sort order">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={sort === s.value ? "active" : ""}
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <ShopFilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} total={total} />
    </>
  );
}