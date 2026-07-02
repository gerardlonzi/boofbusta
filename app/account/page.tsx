import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { LogoutButton } from "@/components/auth/logout-button";

const links = [
  { href: ROUTES.accountOrders, label: "My Orders" },
  { href: ROUTES.accountAddresses, label: "My Addresses" },
  { href: ROUTES.accountWishlist, label: "My Wishlist" },
  { href: ROUTES.accountReviews, label: "My Reviews" },
  { href: ROUTES.accountSettings, label: "Settings" },
];

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-zinc-600">
            Hello, {user.firstName} {user.lastName}
          </p>
        </div>
        <LogoutButton isLoggedIn />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{link.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-zinc-500">Manage →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
