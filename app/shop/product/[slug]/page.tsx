import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/services/product.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { WishlistButton } from "@/components/shop/wishlist-button";
import type { Metadata } from "next";

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.slice(0, 160),
        images: product.images[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return { title: "Produit introuvable" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EUR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Pas d&apos;image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.category && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {avgRating > 0 && (
            <p className="text-sm text-zinc-500">
              ★ {avgRating.toFixed(1)} ({product.reviews.length} avis)
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
          <div className="text-sm text-zinc-500">
            <p>SKU: {product.sku}</p>
            <p>Stock: {product.stock > 0 ? `${product.stock} disponibles` : "Rupture"}</p>
            {product.brand && <p>Marque: {product.brand}</p>}
          </div>
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <ProductPurchasePanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice,
                images: product.images,
                stock: product.stock,
              }}
              disabled={product.stock === 0}
            />
            <WishlistButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice,
                images: product.images,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Avis clients</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {review.user.firstName} {review.user.lastName}
                  </span>
                  <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
                </div>
                {review.comment && <p className="mt-2 text-sm text-zinc-600">{review.comment}</p>}
                {review.adminReply && (
                  <p className="mt-2 rounded bg-zinc-50 p-2 text-sm dark:bg-zinc-900">
                    <strong>Réponse:</strong> {review.adminReply}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
