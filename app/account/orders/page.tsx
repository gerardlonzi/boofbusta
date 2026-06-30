import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/cookies";
import { getUserOrders } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);

  const { orders } = await getUserOrders(session.userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.account} className="text-sm text-zinc-500 hover:underline">
        ← Mon compte
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">Mes commandes</h1>

      {orders.length === 0 ? (
        <p className="text-zinc-500">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-xl border border-zinc-200 p-4 transition-shadow hover:shadow-md dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{order.status}</Badge>
                  <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
