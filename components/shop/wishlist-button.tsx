"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuestWishlist } from "@/hooks/use-guest-commerce";
import type { ProductSnapshot } from "@/types/guest";

interface WishlistButtonProps {
  product: ProductSnapshot;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const { hasItem, toggleWishlist } = useGuestWishlist();
  const [loading, setLoading] = useState(false);
  const active = hasItem(product.id);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await toggleWishlist(product);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 backdrop-blur-sm transition-all hover:border-accent hover:bg-surface",
        active && "border-accent bg-accent/10 text-accent",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-accent")} />
    </button>
  );
}
