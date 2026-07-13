import { ProductCard } from "@/components/shop/product-card";

import { ShopFilters } from "@/components/shop/shop-filters";

import { getProducts } from "@/services/product.service";

import { getCategories } from "@/services/category.service";

import Link from "next/link";
import { buildPaginationUrl } from "@/lib/shop";


export const revalidate = 60;



interface ShopPageProps {

  searchParams: Promise<{

    page?: string;

    search?: string;

    category?: string;

    sort?: string;

    minPrice?: string;

    maxPrice?: string;

    inStock?: string;

  }>;

}



export default async function ShopPage({ searchParams }: ShopPageProps) {

  const params = await searchParams;

  const { products, pagination } = await getProducts({

    page: Number(params.page ?? 1),

    limit: 12,

    search: params.search,

    category: params.category,

    sort: (params.sort as "newest") ?? "newest",

    minPrice: params.minPrice ? Number(params.minPrice) : undefined,

    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,

    inStock: params.inStock === "true",

  });



  const categories = await getCategories();

  const filterParams = { category: params.category, sort: params.sort, search: params.search };



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      <h1 className="mb-2 text-3xl font-bold text-cream">Shop All Products</h1>

      <p className="mb-8 text-muted">Lab-tested • Responsibly sourced • Crafted for the modern day</p>



      <div className="flex flex-col gap-8 lg:flex-row">

        <ShopFilters

          categories={categories}

          currentCategory={params.category}

          currentSort={params.sort}

        />



        <div className="flex-1">

          <p className="mb-4 text-sm text-zinc-500">

            {pagination.total} product{pagination.total > 1 ? "s" : ""}

          </p>

          {products.length === 0 ? (

            <p className="text-zinc-500">No product found.</p>

          ) : (

            <div className="grid grid-cols-2 gap-[5px] md:gap-4 md:grid-cols-3">

              {products.map((product) => (

                <ProductCard key={product.id} product={product} />

              ))}

            </div>

          )}



          {pagination.totalPages > 1 && (

            <div className="mt-8 flex justify-center gap-2">

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (

                <Link

                  key={p}

                  href={buildPaginationUrl(p, filterParams)}

                  className={`rounded-lg px-3 py-1 text-sm ${

                    p === pagination.page

                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"

                      : "border border-zinc-200 dark:border-zinc-800"

                  }`}

                >

                  {p}

                </Link>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

