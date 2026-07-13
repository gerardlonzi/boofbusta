import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/cookies";
import { getUserAddresses } from "@/services/user.service";
import { ROUTES } from "@/constants";

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);

  const addresses = await getUserAddresses(session.userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.account} className="text-sm text-zinc-500 hover:underline">← My Account</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">My Addresses</h1>
      {addresses.length === 0 ? (
        <p className="text-zinc-500">No address registered.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border p-4 dark:border-zinc-800">
              {addr.isDefault && <span className="text-xs font-medium text-green-600">Default</span>}
              <p className="font-medium">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-zinc-600">
                {addr.street}, {addr.postalCode} {addr.city}, {addr.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
