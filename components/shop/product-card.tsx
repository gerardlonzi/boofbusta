"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    stock: number;
    category?: { name: string; slug: string } | null;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const snapshot = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    stock: product.stock,
  };

  return (
    <article
      className={cn(
        "group card-shine flex flex-col overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-hover">
        <Link href={`/shop/product/${product.slug}`} className="block h-full w-full">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
        </Link>

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-bold uppercase tracking-wide text-background">
            Sale
          </span>
        )}

        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistButton product={snapshot} />
          <AddToCartButton product={snapshot} disabled={product.stock === 0} variant="compact" />
        </div>

        <Link
          href={`/shop/product/${product.slug}`}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/90 px-4 py-1.5 text-xs font-medium opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" />
          Quick View
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wider text-muted">{product.category.name}</span>
        )}
        <Link href={`/shop/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-cream transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center gap-2 pt-2">
          {hasDiscount && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.comparePrice!, "USD")}
            </span>
          )}
          <span className="text-lg font-bold text-accent">
            {formatPrice(product.price, "USD")}
          </span>
        </div>
        <div className="flex mt-2 items-center gap-3 flex-wrap sm:flex-nowrap">
        <AddToCartButton
          product={snapshot}
          disabled={product.stock === 0}
          variant="card"
          className=""
        />
        <Link
          href={`/shop/product/${product.slug}`}
          className=" items-center w-full gap-1.5  px-4 py-3 text-xs font-medium bg-accent rounded-lg justify-center flex backdrop-blur-sm transition-opacity group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" />
          Quick View
        </Link>
        </div>
      </div>
    </article>
  );
}
