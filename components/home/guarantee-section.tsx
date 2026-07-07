import { Shield } from "lucide-react";

export function GuaranteeSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center rounded-3xl border border-border bg-surface p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-cream">We Stand Behind Every Product</h2>
        <p className="mt-2 text-xl font-semibold text-accent">100% Money-Back Guarantee</p>
        <p className="mt-4 max-w-2xl text-muted">
          At Boofbusta, your satisfaction is our top priority. If you&apos;re ever unhappy
          with a purchase, we&apos;ll make it right — with a full money-back guarantee on every order.
        </p>
        <p className="mt-6 text-sm text-primary-light">
          Free Same Day Delivery in the Colorado area on orders over $100.
          <br />
          Orders under $100 include a $10 local delivery fee.
        </p>
      </div>
    </section>
  );
}
