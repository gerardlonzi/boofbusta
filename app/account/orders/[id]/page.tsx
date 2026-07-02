import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/cookies";
import { getOrderById } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CancelOrderButton } from "@/components/shop/cancel-order-button";
import { ROUTES } from "@/constants";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);

  const { id } = await params;
  let order;
  try {
    order = await getOrderById(id, session.userId);
  } catch {
    notFound();
  }

  const address = order.shippingAddress as {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.accountOrders} className="text-sm text-zinc-500 hover:underline">
        ← My Orders
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        <Badge>{order.status}</Badge>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold">Articles</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Sous-total</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>TVA</dt><dd>{formatPrice(order.tax)}</dd></div>
            <div className="flex justify-between"><dt>Livraison</dt><dd>{formatPrice(order.shipping)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Adresse de livraison</h2>
          <p className="text-sm text-zinc-600">
            {address.firstName} {address.lastName}<br />
            {address.street}<br />
            {address.postalCode} {address.city}<br />
            {address.country}
          </p>
          {["PENDING", "CONFIRMED"].includes(order.status) && (
            <CancelOrderButton orderId={order.id} />
          )}
        </div>
      </div>
    </div>
  );
}
