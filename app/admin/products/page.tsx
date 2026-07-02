import { redirect } from "next/navigation";

import Link from "next/link";

import { requireAdmin } from "@/lib/auth/cookies";

import { prisma } from "@/lib/prisma";

import { getCategories } from "@/services/category.service";

import { AdminProductManager } from "@/components/admin/admin-product-manager";

import { ROUTES } from "@/constants";



export default async function AdminProductsPage() {

  try {

    await requireAdmin();

  } catch {

    redirect(ROUTES.login);

  }



  const [products, categories] = await Promise.all([

    prisma.product.findMany({

      include: { category: { select: { name: true } } },

      orderBy: { createdAt: "desc" },

    }),

    getCategories(),

  ]);



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>

      <h1 className="mb-8 mt-4 text-3xl font-bold">Manage Products</h1>

      <AdminProductManager

        products={products}

        categories={categories.map((c) => ({ id: c.id, name: c.name }))}

      />

    </div>

  );

}

