import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-4 text-muted">
        <p>
          At {APP_NAME}, we respect your privacy and are committed to protecting your personal
          information. This policy explains how we collect, use, and safeguard your data when you
          shop on our website.
        </p>
        <h2 className="text-xl font-semibold text-cream">Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, placing an order, or
          contacting support — including your name, email address, shipping address, and payment
          details processed securely through Stripe.
        </p>
        <h2 className="text-xl font-semibold text-cream">How We Use Your Information</h2>
        <p>
          Your information is used to process orders, provide customer support, improve our
          services, and send order-related communications. We never sell your personal data to
          third parties.
        </p>
        <h2 className="text-xl font-semibold text-cream">Contact</h2>
        <p>
          For privacy-related questions, please contact our support team through the WhatsApp button
          on our website.
        </p>
      </div>
      <Link href={ROUTES.home} className="mt-8 inline-block text-sm text-accent hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
