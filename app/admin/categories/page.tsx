import { redirect } from "next/navigation";

import Link from "next/link";

import { requireAdmin } from "@/lib/auth/cookies";

import { getCategories } from "@/services/category.service";

import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

import { ROUTES } from "@/constants";



export default async function AdminCategoriesPage() {

  try {

    await requireAdmin();

  } catch {

    redirect(ROUTES.login);

  }



  const categories = await getCategories();



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>

      <h1 className="mb-8 mt-4 text-3xl font-bold">Gestion Catégories</h1>

      <AdminCategoryManager categories={categories} />

    </div>

  );

}

