import Link from "next/link";
import { APP_NAME, NAV_CATEGORIES, ROUTES } from "@/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-10 rounded-2xl border border-border/50 bg-background/50 p-6">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">FDA Disclaimer</h4>
          <p className="text-xs leading-relaxed text-muted">
            This product is not for use by or sale to persons under the age of 18 or 21 depending on
            the laws of your governing state or territory. Consult with a physician before use,
            especially if you have a medical condition or use prescription medications. These
            statements have not been evaluated by the FDA. These products are not intended to
            diagnose, treat, cure or prevent any disease.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-lg font-bold text-cream">{APP_NAME}</h3>
            <p className="text-sm text-muted">
              Premium microdose edibles and functional treats engineered for consistent, gentle
              effects. Lab-tested and manufactured to deliver precise microdose experiences.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream">Useful Links</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-accent">Products</Link></li>
              <li><Link href="/shop/promotions" className="hover:text-accent">Promotions</Link></li>
              <li><Link href={ROUTES.cart} className="hover:text-accent">My Cart</Link></li>
              <li><Link href={ROUTES.wishlist} className="hover:text-accent">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream">Custom Area</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href={ROUTES.login} className="hover:text-accent">My Account</Link></li>
              <li><Link href={ROUTES.cart} className="hover:text-accent">My Cart</Link></li>
              <li><Link href="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream">Categories</h4>
            <ul className="space-y-2 text-sm text-muted">
              {NAV_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/shop/category/${cat.slug}`} className="hover:text-accent">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-accent">
            <span className="text-lg font-bold">4.5</span>
            <span className="text-sm text-muted">out of 5 stars</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
