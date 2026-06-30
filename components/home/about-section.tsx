export function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm font-medium uppercase tracking-widest text-accent">Mushroom</span>
          <h2 className="mt-2 text-3xl font-bold text-cream">Know about us</h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            <p>
              Micro Dose Kitchen premium collection of legal mushroom products showcases a diverse
              selection of beneficial mushroom species, from soothing, psychedelic amanita muscaria
              products to non-intoxicating, cognitive-enhancing options like lion&apos;s mane.
            </p>
            <p>
              Whether you&apos;re discovering mushroom-infused drinks, gummies, candies, or vaping
              products, each item is crafted with pure, lab-tested mushroom extracts and clearly
              labeled so you can enjoy with confidence.
            </p>
            <p>
              From legal amanita muscaria products that offer a blissful, transformative experience
              to lion&apos;s mane mushroom products designed to enhance mental focus and relaxation,
              our collection combines ancient wisdom with cutting-edge innovation.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-surface to-accent/10">
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">🍄</div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-sm font-medium text-primary-light sm:text-base">
          Free Same Day Delivery in the Colorado area on orders over $100. Orders under $100 include
          a $10 local delivery fee. We ship anywhere outside of Colorado.
        </p>
        <p className="mt-2 text-xs text-muted">We accept a variety of secure electronic payments</p>
      </div>
    </section>
  );
}
