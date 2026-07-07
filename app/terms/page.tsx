import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants";

export const metadata = {
  title: "Shipping Policy",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Shipping Policy</h1>
      <div className="prose prose-invert max-w-none space-y-4 text-muted">
        <p>
          {APP_NAME} offers discreet, secure shipping on all orders. Below is an overview of our
          shipping and delivery policies.
        </p>
        <h2 className="text-xl font-semibold text-cream">Processing Time</h2>
        <p>
          Orders are typically processed within 1–2 business days after payment confirmation.
          You will receive an email with tracking information once your order ships.
        </p>
        <h2 className="text-xl font-semibold text-cream">Free Shipping</h2>
        <p>
          Free same-day delivery is available on orders over $100 within eligible delivery zones.
        </p>
        <h2 className="text-xl font-semibold text-cream">Returns</h2>
        <p>
          Unopened products may be returned within 10 days of delivery for a full refund. Contact
          our support team to initiate a return.
        </p>
      </div>
      <Link href={ROUTES.home} className="mt-8 inline-block text-sm text-accent hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
