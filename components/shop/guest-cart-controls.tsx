"use client";



import { useCartStore } from "@/store/cart-store";



interface CartItemControlsProps {

  productId: string;

  quantity: number;

}



async function syncQuantity(productId: string, quantity: number) {

  const me = await fetch("/api/auth/me");

  if (!me.ok) return;

  if (quantity === 0) {

    await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });

  } else {

    await fetch("/api/cart", {

      method: "PATCH",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ productId, quantity }),

    });

  }

}



export function CartItemControls({ productId, quantity }: CartItemControlsProps) {

  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const removeItem = useCartStore((s) => s.removeItem);



  function handleUpdate(newQty: number) {

    updateQuantity(productId, newQty);

    syncQuantity(productId, newQty);

  }



  function handleRemove() {

    removeItem(productId);

    syncQuantity(productId, 0);

  }



  return (

    <div className="mt-2 flex items-center gap-2">

      <button

        type="button"

        onClick={() => handleUpdate(quantity - 1)}

        disabled={quantity <= 1}

        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm hover:bg-surface-hover disabled:opacity-40"

      >

        −

      </button>

      <span className="w-8 text-center text-sm">{quantity}</span>

      <button

        type="button"

        onClick={() => handleUpdate(quantity + 1)}

        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm hover:bg-surface-hover"

      >

        +

      </button>

      <button

        type="button"

        onClick={handleRemove}

        className="ml-2 text-xs text-red-400 hover:underline"

      >

        Remove

      </button>

    </div>

  );

}

