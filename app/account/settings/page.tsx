import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/constants";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href={ROUTES.account} className="text-sm text-zinc-500 hover:underline">← Mon compte</Link>
      <h1 className="mb-8 mt-4 text-3xl font-bold">Paramètres</h1>
      <dl className="space-y-3 text-sm">
        <div><dt className="text-zinc-500">Nom</dt><dd>{user.firstName} {user.lastName}</dd></div>
        <div><dt className="text-zinc-500">Email</dt><dd>{user.email}</dd></div>
        <div><dt className="text-zinc-500">Username</dt><dd>{user.username}</dd></div>
        <div><dt className="text-zinc-500">Email vérifié</dt><dd>{user.emailVerified ? "Oui" : "Non"}</dd></div>
      </dl>
    </div>
  );
}
