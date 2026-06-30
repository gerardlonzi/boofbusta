import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/cookies";
import { getAdminOrders } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ROUTES } from "@/constants";

export default async function AdminOrdersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect(ROUTES.login);
  }

  const { orders } = await getAdminOrders();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">Gestion Commandes</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-zinc-500">
                  {order.user.firstName} {order.user.lastName} — {order.user.email}
                </p>
                <p className="text-sm text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge>{order.paymentStatus}</Badge>
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
