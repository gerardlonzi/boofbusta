import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/cookies";
import { getWishlist } from "@/services/wishlist.service";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);

  const wishlist = await getWishlist(session.userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.account} className="text-sm text-zinc-500 hover:underline">← My Account</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">My Wishlist</h1>
      {wishlist.items.length === 0 ? (
        <p className="text-zinc-500">Votre wishlist est vide.</p>
      ) : (
        <div className="space-y-4">
          {wishlist.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border p-4 dark:border-zinc-800">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-zinc-100">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <Link href={`/shop/product/${item.product.slug}`} className="font-medium hover:underline">
                  {item.product.name}
                </Link>
                <p className="text-sm">{formatPrice(item.product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
