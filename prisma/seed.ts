import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Shrooms", slug: "shrooms", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400" },
  { name: "Shroom Vape Pens", slug: "shroom-vape-pens", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee598b2?w=400" },
  { name: "Shroom Bars", slug: "shroom-bars", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400" },
  { name: "Shroom Capsules", slug: "shroom-capsules", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400" },
  { name: "DMT", slug: "dmt", image: "https://images.unsplash.com/photo-1615485500707-6c4192c92424?w=400" },
  { name: "LSD", slug: "lsd", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400" },
  { name: "Other Sparks", slug: "other-sparks", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400" },
  { name: "Liquids", slug: "liquids", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
];

const PRODUCTS = [
  {
    name: "Magic Mushroom Gummies – Blue Razz (3.5g)",
    slug: "magic-mushroom-gummies-blue-razz",
    description: "Each package contains 14 gummies (3.5g total). Every gummy has 250mg psilocybin equivalent. Smooth high, perfect trip!",
    price: 45,
    comparePrice: 60,
    sku: "MG-BR-001",
    categorySlug: "shrooms",
    brand: "Micro Dose Kitchen",
    tags: ["gummies", "microdose", "sale"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"],
  },
  {
    name: "Magic Mushrooms Gummies – Fruit Punch (3.5g)",
    slug: "magic-mushroom-gummies-fruit-punch",
    description: "Our Magic Mushroom Gummies are out of this world! 14 gummies per package, 250mg each.",
    price: 45,
    comparePrice: 60,
    sku: "MG-FP-002",
    categorySlug: "shrooms",
    brand: "Micro Dose Kitchen",
    tags: ["gummies", "fruit-punch", "sale"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
  },
  {
    name: "Apple Tart Microdose Magic Mushroom Vape Pen",
    slug: "apple-tart-microdose-vape-pen",
    description: "Premium microdose mushroom vape pen. Lab-tested, discreet, and travel-friendly.",
    price: 55,
    sku: "VP-AT-003",
    categorySlug: "shroom-vape-pens",
    brand: "Micro Dose Kitchen",
    tags: ["vape", "microdose"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1607619056574-7b8d3ee598b2?w=800"],
  },
  {
    name: "Muscimol Mushroom & THC-A Disposable 2 Grams",
    slug: "muscimol-disposable-2g",
    description: "2000mg disposable vape. Third-party tested, consistent potency.",
    price: 35,
    comparePrice: 50,
    sku: "VP-MU-004",
    categorySlug: "shroom-vape-pens",
    brand: "Micro Dose Kitchen",
    tags: ["vape", "disposable", "sale"],
    featured: false,
    images: ["https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"],
  },
  {
    name: "5-MeO-DMT Powder 3g",
    slug: "5meo-dmt-powder-3g",
    description: "Premium grade powder. Lab-tested with full reports available.",
    price: 200,
    comparePrice: 250,
    sku: "DMT-5M-005",
    categorySlug: "dmt",
    brand: "Micro Dose Kitchen",
    tags: ["dmt", "powder"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1615485500707-6c4192c92424?w=800"],
  },
  {
    name: "Animal Fractal LSD Blotter",
    slug: "animal-fractal-lsd-blotter",
    description: "Premium blotter art. Third-party tested for purity and potency.",
    price: 200,
    comparePrice: 250,
    sku: "LSD-AF-006",
    categorySlug: "lsd",
    brand: "Micro Dose Kitchen",
    tags: ["lsd", "blotter"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1550684848-fac1c5b4f853?w=800"],
  },
  {
    name: "Mixed Berry Trippy Potion Shot (35mg)",
    slug: "mixed-berry-trippy-potion",
    description: "35mg Psilo-Bene liquid shot. Fast-acting, smooth experience.",
    price: 50,
    comparePrice: 60,
    sku: "LQ-MB-007",
    categorySlug: "liquids",
    brand: "Micro Dose Kitchen",
    tags: ["liquid", "shot"],
    featured: false,
    images: ["https://images.unsplash.com/photo-1546173159-315724a31696?w=800"],
  },
  {
    name: "Mushiez Silly Caps – Ultra-Potent Microdose",
    slug: "mushiez-silly-caps",
    description: "Ultra-potent microdose capsules for clarity, creativity, and deep introspection.",
    price: 65,
    sku: "CAP-MS-008",
    categorySlug: "shroom-capsules",
    brand: "Mushiez",
    tags: ["capsules", "microdose"],
    featured: true,
    images: ["https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800"],
  },
];

async function main() {
  console.log("🌱 Seeding Micro Dose Kitchen database...");

  const adminPassword = await hashPassword(process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!@#");
  const admin = await prisma.user.upsert({
    where: { email: "admin@shopflow.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "MDK",
      username: "admin",
      email: "admin@shopflow.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  await prisma.cart.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });
  await prisma.wishlist.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });

  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, image: cat.image },
      create: { name: cat.name, slug: cat.slug, description: `${cat.name} — premium lab-tested products`, image: cat.image },
    });
    categoryMap[cat.slug] = created.id;
  }

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        status: "ACTIVE",
        featured: p.featured,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: 100,
        sku: p.sku,
        categoryId: categoryMap[p.categorySlug],
        brand: p.brand,
        tags: p.tags,
        status: "ACTIVE",
        featured: p.featured,
        images: p.images,
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENTAGE", value: 10, minPurchase: 50, maxUses: 1000, isActive: true },
  });

  console.log("✅ Seed completed — 8 categories, 8 products");
  console.log("   Admin: admin@shopflow.com (password from ADMIN_SEED_PASSWORD env var)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
