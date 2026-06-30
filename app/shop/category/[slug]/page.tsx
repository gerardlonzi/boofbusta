import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/services/category.service";
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/components/shop/product-card";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  const { products, pagination } = await getProducts({
    page: Number(page ?? 1),
    limit: 12,
    sort: "newest",
    category: slug,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-zinc-600">{category.description}</p>
      )}
      <p className="mb-6 mt-4 text-sm text-zinc-500">
        {pagination.total} produit{pagination.total > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
