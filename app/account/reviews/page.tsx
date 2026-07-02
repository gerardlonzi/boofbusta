import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/constants";

export default async function AccountReviewsPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);

  const reviews = await prisma.review.findMany({
    where: { userId: session.userId },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.account} className="text-sm text-zinc-500 hover:underline">← My Account</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">My Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-zinc-500">Vous n&apos;avez pas encore laissé d&apos;avis.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border p-4 dark:border-zinc-800">
              <Link href={`/shop/product/${r.product.slug}`} className="font-medium hover:underline">
                {r.product.name}
              </Link>
              <p className="text-yellow-500">{"★".repeat(r.rating)}</p>
              {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
