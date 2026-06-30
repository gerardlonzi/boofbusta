import Link from "next/link";

import Image from "next/image";



interface CategoryGridProps {

  dbCategories: Array<{

    id: string;

    name: string;

    slug: string;

    image?: string | null;

    _count?: { products: number };

  }>;

}



const CATEGORY_IMAGES: Record<string, string> = {

  shrooms: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400",

  "shroom-vape-pens": "https://images.unsplash.com/photo-1607619056574-7b8d3ee598b2?w=400",

  "shroom-bars": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",

  "shroom-capsules": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",

  dmt: "https://images.unsplash.com/photo-1615485500707-6c4192c92424?w=400",

  lsd: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400",

  "other-sparks": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",

  liquids: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",

};



function getCategoryImage(cat: CategoryGridProps["dbCategories"][0]) {

  return cat.image ?? CATEGORY_IMAGES[cat.slug] ?? "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400";

}



export function CategoryGrid({ dbCategories }: CategoryGridProps) {

  if (dbCategories.length === 0) return null;



  return (

    <section className="section-cream px-4 py-16 sm:px-6">

      <div className="mx-auto max-w-7xl">

        <h2 className="text-center text-2xl font-bold sm:text-3xl">Top Product Category</h2>

        <p className="mt-2 text-center text-zinc-600">View our category displayed products</p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

          {dbCategories.map((cat) => (

            <Link

              key={cat.id}

              href={`/shop/category/${cat.slug}`}

              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-primary hover:shadow-lg"

            >

              <div className="relative aspect-square overflow-hidden">

                <Image

                  src={getCategoryImage(cat)}

                  alt={cat.name}

                  fill

                  className="object-cover transition-transform duration-300 group-hover:scale-105"

                  sizes="(max-width: 640px) 50vw, 25vw"

                />

              </div>

              <div className="p-4 text-center">

                <h3 className="text-sm font-semibold leading-tight">{cat.name}</h3>

                {cat._count && (

                  <p className="mt-1 text-xs text-zinc-500">{cat._count.products} produits</p>

                )}

              </div>

            </Link>

          ))}

        </div>

      </div>

    </section>

  );

}

