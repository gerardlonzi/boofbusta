import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-4 text-5xl">✓</div>
      <h1 className="text-2xl font-bold">Order confirmed!</h1>
      {params.order && (
        <p className="mt-2 text-zinc-600">
          Order number: <strong>{params.order}</strong>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href={ROUTES.accountOrders}>View my orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.shop}>Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
