"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import { buildPaginationUrl } from "@/lib/shop";

interface ShopFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  currentCategory?: string;
  currentSort?: string;
}

function buildShopUrl(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val) search.set(key, val);
  });
  const qs = search.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function ShopFilters({ categories, currentCategory, currentSort }: ShopFiltersProps) {
  const [open, setOpen] = useState(false);

  const filterContent = (
    <>
      <h2 className="mb-3 font-semibold">Categories</h2>
      <ul className="space-y-2 text-sm">
        <li>
          <Link
            href={buildShopUrl({ sort: currentSort })}
            className={cn(
              "hover:underline",
              !currentCategory ? "font-semibold text-cream" : "text-zinc-600 dark:text-zinc-400"
            )}
            onClick={() => setOpen(false)}
          >
            All
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={buildShopUrl({ category: cat.slug, sort: currentSort })}
              className={cn(
                "hover:underline",
                currentCategory === cat.slug
                  ? "font-semibold text-cream"
                  : "text-zinc-600 dark:text-zinc-400"
              )}
              onClick={() => setOpen(false)}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 mt-6 font-semibold">Sort</h2>
      <ul className="space-y-2 text-sm">
        {SORT_OPTIONS.map((opt) => (
          <li key={opt.value}>
            <Link
              href={buildShopUrl({ category: currentCategory, sort: opt.value })}
              className={cn(
                "hover:underline",
                (currentSort ?? "newest") === opt.value
                  ? "font-semibold text-cream"
                  : "text-zinc-600 dark:text-zinc-400"
              )}
              onClick={() => setOpen(false)}
            >
              {opt.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {(currentCategory || (currentSort && currentSort !== "newest")) && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">Active</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </aside>
        </div>
      )}

      <aside className="hidden w-56 shrink-0 lg:block">{filterContent}</aside>
    </>
  );
}

