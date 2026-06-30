"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Subscribed! Don't miss our news.");
    setEmail("");
    setLoading(false);
  }

  return (
    <section className="section-cream px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold">Don&apos;t Miss Our News</h2>
        <p className="mt-2 text-zinc-600">Subscribe for exclusive offers and product updates.</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? "..." : "SUBSCRIBE"}
          </button>
        </form>
      </div>
    </section>
  );
}
