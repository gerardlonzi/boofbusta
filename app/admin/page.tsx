import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/cookies";
import { getAdminStats } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ROUTES } from "@/constants";

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect(ROUTES.login);
  }

  const stats = await getAdminStats();

  const cards = [
    { label: "Commandes", value: stats.totalOrders, href: ROUTES.adminOrders },
    { label: "Produits actifs", value: stats.totalProducts, href: ROUTES.adminProducts },
    { label: "Clients", value: stats.totalUsers, href: ROUTES.adminUsers },
    { label: "Revenus", value: formatPrice(stats.revenue), href: ROUTES.adminOrders },
  ];

  const nav = [
    { href: ROUTES.adminProducts, label: "Produits" },
    { href: ROUTES.adminCategories, label: "Catégories" },
    { href: ROUTES.adminOrders, label: "Commandes" },
    { href: ROUTES.adminUsers, label: "Utilisateurs" },
    { href: ROUTES.adminCoupons, label: "Coupons" },
    { href: ROUTES.adminReviews, label: "Avis" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Dashboard Admin</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-500">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-semibold">Gestion</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-zinc-200 p-4 hover:shadow-md dark:border-zinc-800"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
