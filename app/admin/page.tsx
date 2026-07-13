import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/cookies";
import { getAdminStats } from "@/services/order.service";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
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
    { label: "Orders", value: stats.totalOrders, href: ROUTES.adminOrders },
    { label: "Active Products", value: stats.totalProducts, href: ROUTES.adminProducts },
    { label: "Customers", value: stats.totalUsers, href: ROUTES.adminUsers },
    { label: "Revenue", value: formatPrice(stats.revenue), href: ROUTES.adminOrders },
  ];

  const nav = [
    { href: ROUTES.adminProducts, label: "Products" },
    { href: ROUTES.adminCategories, label: "Categories" },
    { href: ROUTES.adminOrders, label: "Orders" },
    { href: ROUTES.adminUsers, label: "Users" },
    { href: ROUTES.adminCoupons, label: "Coupons" },
    { href: ROUTES.adminReviews, label: "Reviews" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex justify-between">      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard </h1>
          <LogoutButton/></div>


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

      <h2 className="mb-4 text-xl font-semibold">Management</h2>
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
