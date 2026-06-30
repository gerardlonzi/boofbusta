import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export default function CheckoutErrorPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-4 text-5xl text-red-500">✕</div>
      <h1 className="text-2xl font-bold">Paiement échoué</h1>
      <p className="mt-2 text-zinc-600">
        Une erreur est survenue lors du paiement. Veuillez réessayer.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href={ROUTES.checkout}>Réessayer</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.cart}>Retour au panier</Link>
        </Button>
      </div>
    </div>
  );
}
