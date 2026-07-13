import { redirect } from "next/navigation";

import Link from "next/link";

import { requireAdmin } from "@/lib/auth/cookies";

import { getUsers } from "@/services/user.service";

import { AdminUserManager } from "@/components/admin/admin-user-manager";

import { ROUTES } from "@/constants";



export default async function AdminUsersPage() {

  try {

    await requireAdmin();

  } catch {

    redirect(ROUTES.login);

  }



  const { users } = await getUsers();



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>

      <h1 className="mb-8 mt-4 text-3xl font-bold">Manage users</h1>

      <AdminUserManager users={users} />

    </div>

  );

}

