import { getFeaturedProducts, getPromotions } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { HeroSection } from "@/components/home/hero-section";
import { TrustBadges } from "@/components/home/trust-badges";
import { ProductSection } from "@/components/home/product-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { AboutSection } from "@/components/home/about-section";
import { QualitySection } from "@/components/home/quality-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { GuaranteeSection } from "@/components/home/guarantee-section";
import Link from "next/link";
import Image from "next/image"

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, promotions, categories] = await Promise.all([
    getFeaturedProducts(8),
    getPromotions(8),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />
      <TrustBadges />
      <AboutSection />

      <ProductSection
        title="Shop Discounted Products"
        subtitle="View our discounted displayed products"
        viewAllHref="/shop/promotions"
        products={promotions}
      />

      <CategoryGrid dbCategories={categories} />
      <QualitySection />

      <ProductSection
        title="Featured Products"
        subtitle="View our featured displayed products"
        viewAllHref="/shop"
        products={featured}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl md:min-h-0 h-[40rem] border border-border bg-surface">
          <div className="md:grid h-full md:grid-cols-2 flex flex-col">
            <div className="flex flex-col justify-center h-full p-8 sm:p-12">
              <span className="text-lg font-medium uppercase tracking-widest text-accent">From $45</span>
              <h2 className="mt-2 text-3xl md:text-5xl font-bold text-cream">Shroom Gummies – Fruit Punch Flavor</h2>
              <p className="mt-4 text-muted leading-relaxed">
              Our Magic Mushroom Gummies are out of this world!

Each package of magic mushroom candies contains 14 gummies (total 3.5 grams per package)

every individual Shroom Gummy has 250mg of psilocybin equivalent to 1 microdose

The high is very smooth, with little to no stomach cramping with the perfect kick!

These are the perfect way to have a good time and get the perfect trip!
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex w-fit items-center rounded-xl bg-accent px-8 py-3 font-semibold text-background transition-colors hover:bg-accent-muted"
              >
                Buy Now
              </Link>
            </div>
            <div className="relative   h-full md:min-h-0 bg-gradient-to-br from-primary/30 to-accent/10 " >
            
            <Image
                  src="/gummies-fruit.png"
                  alt="champignon pic"
                  fill
                  className="object-cover h-full transition-transform duration-300 "
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <GuaranteeSection />
    </>
  );
}
