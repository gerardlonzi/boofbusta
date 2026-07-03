import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="hero-glow relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-light">
          <Sparkles className="h-3.5 w-3.5" />
          Lab-tested • Responsibly Sourced
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-gradient-gold">MicroDose.</span>{" "}
          <span className="text-cream">Reliable.</span>
          <br />
          <span className="text-cream/90">Crafted for the modern day</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Taste the Balance — Nourish Mind, Body, and Mood with premium, lab-tested microdose products.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
          >
            Shop Microdose Products
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop/promotions"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-medium text-cream transition-colors hover:border-accent hover:text-accent"
          >
            How microdosing works
          </Link>
        </div>
      </div>
    </section>
  );
}
