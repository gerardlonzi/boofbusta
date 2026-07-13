import { redirect } from "next/navigation";

import Link from "next/link";

import { requireAdmin } from "@/lib/auth/cookies";

import { getCoupons } from "@/services/user.service";

import { AdminCouponManager } from "@/components/admin/admin-coupon-manager";

import { ROUTES } from "@/constants";



export default async function AdminCouponsPage() {

  try { await requireAdmin(); } catch { redirect(ROUTES.login); }

  const coupons = await getCoupons();



  return (

    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      <Link href={ROUTES.admin} className="text-sm text-zinc-500 hover:underline">← Dashboard</Link>

      <h1 className="mb-8 mt-4 text-3xl font-bold">Manage coupons Coupons</h1>

      <AdminCouponManager coupons={JSON.parse(JSON.stringify(coupons))} />

    </div>

  );

}

