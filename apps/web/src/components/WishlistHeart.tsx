"use client";

import {useEffect, useState} from "react";

const KEY = "verse-mode-wishlist";

function readList(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistHeart({slug, label}: {slug: string; label: string}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readList().includes(slug));
  }, [slug]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = new Set(readList());
    if (list.has(slug)) list.delete(slug);
    else list.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...list]));
    setOn(list.has(slug));
  }

  return (
    <button
      type="button"
      className={`wishlist-heart ${on ? "wishlist-heart-on" : ""}`}
      onClick={toggle}
      aria-label={on ? `Remove ${label} from wishlist` : `Save ${label} to wishlist`}
      aria-pressed={on}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}