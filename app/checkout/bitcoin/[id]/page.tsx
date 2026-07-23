

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BitcoinPaymentClient } from "@/components/shop/bitcoin-payment-client";

export const metadata: Metadata = {
  title: "Paiement Bitcoin",
  description: "Finalisez votre paiement en Bitcoin",
  // Empêche l'indexation de cette page
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BitcoinCheckoutPage({ params }: Props) {
  const { id } = await params;

  // Validation basique de l'id (MongoDB ObjectId = 24 hex chars)
  if (!id || !/^[a-f\d]{24}$/i.test(id)) {
    notFound();
  }

  return <BitcoinPaymentClient orderId={id} />;
}