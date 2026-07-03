"use client";



import { useState } from "react";

import Link from "next/link";

import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGuestCart } from "@/hooks/use-guest-commerce";

import { ROUTES } from "@/constants";

import type { ProductSnapshot } from "@/types/guest";



interface AddToCartButtonProps {

  product: ProductSnapshot;

  disabled?: boolean;

  variant?: "default" | "compact" | "card";

  className?: string;

  quantity?: number;

}



export function AddToCartButton({

  product,

  disabled,

  variant = "default",

  className,

  quantity = 1,

}: AddToCartButtonProps) {

  const { addToCart } = useGuestCart();

  const [loading, setLoading] = useState(false);

  const [added, setAdded] = useState(false);



  async function handleClick(e?: React.MouseEvent) {

    e?.preventDefault();

    e?.stopPropagation();

    setLoading(true);

    try {

      await addToCart(product, quantity);

      setAdded(true);

    } finally {

      setLoading(false);

    }

  }



  if (added && variant === "card") {

    return (

      <Link

        href={ROUTES.cart}

        onClick={(e) => e.stopPropagation()}

        className={cn(

          "block w-full rounded-lg border-2 border-primary py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white",

          className

        )}

      >

        See Cart 

      </Link>

    );

  }



  if (variant === "compact") {

    return (

      <button

        type="button"

        onClick={handleClick}

        disabled={disabled || loading}

        className={cn(

          "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-light disabled:opacity-50",

          className

        )}

        aria-label="Add to cart"

      >

        <ShoppingBag className="h-4 w-4" />

      </button>

    );

  }



  if (variant === "card") {

    return (

      <button

        type="button"

        onClick={handleClick}

        disabled={disabled || loading}

        className={cn(

          "w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light disabled:opacity-50",

          className

        )}

      >

        {loading ? "Adding..." : disabled ? "Out of stock" : "Add to cart"}

      </button>

    );

  }



  return (

    <div className="flex flex-wrap items-center gap-3">

      <button

        type="button"

        onClick={handleClick}

        disabled={disabled || loading}

        className={cn(

          "inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50",

          className

        )}

      >

        <ShoppingBag className="h-5 w-5" />

        {loading ? "Adding..." : disabled ? "Out of stock" : "Add to cart"}

      </button>

      {added && (

        <Link

          href={ROUTES.cart}

          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"

        >

          See Cart

        </Link>

      )}

    </div>

  );

}

