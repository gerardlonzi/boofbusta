import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/cookies";
import { getAllReviews } from "@/services/review.service";
import { ROUTES } from "@/constants";

export default async function AdminReviewsPage() {
  try { await requireAdmin(); } catch { redirect(ROUTES.login); }
  const { reviews } = await getAllReviews();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">Gestion Avis</h1>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border p-4 dark:border-zinc-800">
            <div className="flex justify-between">
              <span className="font-medium">{r.user.firstName} {r.user.lastName}</span>
              <span>{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-sm text-zinc-500">{r.product.name}</p>
            {r.comment && <p className="mt-2">{r.comment}</p>}
            {r.adminReply && <p className="mt-2 rounded bg-zinc-50 p-2 text-sm dark:bg-zinc-900">Réponse: {r.adminReply}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
