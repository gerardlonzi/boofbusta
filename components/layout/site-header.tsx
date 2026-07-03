"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { APP_NAME, ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { toast } from "sonner";

interface SiteHeaderProps {
  user: {
    firstName: string;
    role: string;
  } | null;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function SiteHeader({ user, categories }: SiteHeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);



  return (
    <>
      <div className="border-b border-border/50 bg-surface/80 text-center text-xs tracking-wide text-muted">
        <p className="py-2">
          Lab-tested • Responsibly Sourced • Free Same Day Delivery on orders over $100
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={ROUTES.home} className="shrink-0">
            <span className="text-lg font-bold tracking-tight text-cream sm:text-xl">
              {APP_NAME}
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <Link
              href={ROUTES.home}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-cream"
            >
              Home
            </Link>
            <Link
              href={ROUTES.shop}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-cream"
            >
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/category/${cat.slug}`}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-cream"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" asChild className="text-muted hover:text-cream">
              <Link href="/shop/search" aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="text-muted hover:text-cream">
                  <Link
                    href={user.role === "ADMIN" ? ROUTES.admin : ROUTES.account}
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
               
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hidden text-muted hover:text-cream sm:inline-flex">
                <Link href={ROUTES.login}>Login</Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild className="relative text-muted hover:text-cream">
              <Link href={ROUTES.wishlist} aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative text-muted hover:text-cream">
              <Link href={ROUTES.cart} aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border bg-surface px-4 py-4 lg:hidden">
            <Link href={ROUTES.home} className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href={ROUTES.shop} className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop/category/${cat.slug}`}
                className="block py-2 text-sm text-muted"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? ROUTES.admin : ROUTES.account}
                  className="mt-2 block py-2 text-sm text-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="block py-2 text-sm text-red-400"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href={ROUTES.login}
                className="mt-2 block py-2 text-sm text-accent"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
