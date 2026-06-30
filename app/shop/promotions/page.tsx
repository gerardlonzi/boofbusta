import { ProductCard } from "@/components/shop/product-card";
import { getPromotions } from "@/services/product.service";

export const revalidate = 3600;

export default async function PromotionsPage() {
  const products = await getPromotions(24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Promotions</h1>
      {products.length === 0 ? (
        <p className="text-zinc-500">Aucune promotion en cours.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
