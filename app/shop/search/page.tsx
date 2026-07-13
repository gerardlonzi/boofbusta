import { ProductCard } from "@/components/shop/product-card";
import { getProducts } from "@/services/product.service";
import { SearchForm } from "@/components/shop/search-form";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";

  const result = query
    ? await getProducts({ page: Number(params.page ?? 1), limit: 12, sort: "newest", search: query })
    : { products: [], pagination: { total: 0, page: 1, totalPages: 0, limit: 12 } };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Search</h1>
      <SearchForm defaultValue={query} />
      {query && (
        <>
          <p className="mb-4 mt-6 text-sm text-zinc-500">
            {result.pagination.total} Result{result.pagination.total > 1 ? "s" : ""} For {query}&quot;
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {result.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
