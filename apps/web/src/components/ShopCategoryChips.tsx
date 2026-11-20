import Link from "next/link";

const CHIPS = [
  {href: "/shop", label: "All", key: "all"},
  {href: "/shop?category=tees", label: "Tees", key: "tees"},
  {href: "/shop?category=pants", label: "Track pants", key: "pants"},
  {href: "/shop?sort=featured", label: "Editor's pick", key: "featured"},
  {href: "/designs", label: "Design archive", key: "archive"},
] as const;

export function ShopCategoryChips({activeCategory}: {activeCategory?: string}) {
  return (
    <div className="shop-category-rail" role="navigation" aria-label="Shop categories">
      {CHIPS.map((c) => {
        const active =
          c.key === "all"
            ? !activeCategory
            : c.key === "featured"
              ? false
              : c.key === "archive"
                ? false
                : activeCategory === c.key;
        return (
          <Link key={c.href} href={c.href} className={active ? "chip-active" : ""}>
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}