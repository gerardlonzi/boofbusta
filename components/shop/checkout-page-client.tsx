"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/validations/commerce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { syncGuestDataOnLogin } from "@/hooks/use-guest-commerce";

type Summary = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
};

export function CheckoutPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);

  // ── On capture les items Zustand UNE SEULE FOIS au montage ──────────────
  // via un ref pour éviter que le useEffect ne se ré-exécute si le store
  // change pendant la sync (ce qui causait le doublement des totaux)
  const zustandItemsRef = useRef(useCartStore.getState().items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "bitcoin",
      shippingMethod: "standard",
      shippingAddress: {
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        postalCode: "",
        country: "US",
      },
    },
  });

  // ── Sync du panier — exécuté UNE SEULE FOIS au montage ─────────────────
  useEffect(() => {
    async function syncCart() {
      try {
        await syncGuestDataOnLogin();

        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Impossible de charger le panier");

        const json = await res.json();
        const serverItems: { productId: string; quantity: number }[] =
          json.data.cart.items ?? [];
        const serverTotals: Summary | undefined = json.data.cart.totals;

        // ── Cas 1 : panier serveur vide mais Zustand a des items ───────────
        // On pousse les items guest vers le serveur puis on refetch
        if (serverItems.length === 0 && zustandItemsRef.current.length > 0) {
          await Promise.all(
            zustandItemsRef.current.map((item) =>
              fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: item.productId,
                  quantity: item.quantity,
                }),
              })
            )
          );

          const retry = await fetch("/api/cart");
          if (!retry.ok) throw new Error("Impossible de recharger le panier");
          const retryJson = await retry.json();

          // On utilise TOUJOURS les totaux calculés par le serveur
          // car il a accès aux vrais prix DB — jamais de recalcul client
          setSummary(retryJson.data.cart.totals ?? null);
          console.log("montage 0")

          return;
        }

        // ── Cas 2 : panier serveur a des items → utiliser ses totaux ───────
        // Le serveur calcule les totaux avec les prix réels de la DB
        // C'est la source de vérité — on n'utilise JAMAIS zustandItems.price
        // pour recalculer (les prix Zustand viennent du localStorage
        // et peuvent être obsolètes ou incorrects)
        setSummary(serverTotals ?? null);
      } catch (err) {
        console.error("[checkout] syncCart error:", err);
        // Panier vide ou erreur réseau → on affiche null (panier vide)
        setSummary(null);
      } finally {
        setSyncing(false);
      }
    }

    syncCart();
console.log("montage 1")
    // ⚠️ Pas de dépendances — on exécute UNE SEULE FOIS au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Soumission ───────────────────────────────────────────────────────────
  async function onSubmit(data: CheckoutInput) {
    setLoading(true);
    try {
      await syncGuestDataOnLogin();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, paymentMethod: "bitcoin" }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Une erreur est survenue");
      }

      if (json.data.checkoutUrl) {
        // ✅ Redirection vers /checkout/bitcoin/[orderId]
        // Le cart sera vidé UNIQUEMENT après confirmation du paiement
        // par confirmOrderPayment() — jamais ici
        router.push(json.data.checkoutUrl);
      } else {
        throw new Error("URL de paiement Bitcoin manquante");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  // ── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Finaliser la commande</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold dark:bg-amber-900">
            ₿
          </span>
          Paiement exclusivement en Bitcoin
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Formulaire adresse ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      {...register("shippingAddress.firstName")}
                      autoComplete="given-name"
                    />
                    {errors.shippingAddress?.firstName && (
                      <p className="text-xs text-red-600">
                        {errors.shippingAddress.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      {...register("shippingAddress.lastName")}
                      autoComplete="family-name"
                    />
                    {errors.shippingAddress?.lastName && (
                      <p className="text-xs text-red-600">
                        {errors.shippingAddress.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="street">Adresse</Label>
                  <Input
                    id="street"
                    {...register("shippingAddress.street")}
                    autoComplete="street-address"
                  />
                  {errors.shippingAddress?.street && (
                    <p className="text-xs text-red-600">
                      {errors.shippingAddress.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      {...register("shippingAddress.city")}
                      autoComplete="address-level2"
                    />
                    {errors.shippingAddress?.city && (
                      <p className="text-xs text-red-600">
                        {errors.shippingAddress.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      {...register("shippingAddress.postalCode")}
                      autoComplete="postal-code"
                    />
                    {errors.shippingAddress?.postalCode && (
                      <p className="text-xs text-red-600">
                        {errors.shippingAddress.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    {...register("shippingAddress.country")}
                    autoComplete="country"
                  />
                  {errors.shippingAddress?.country && (
                    <p className="text-xs text-red-600">
                      {errors.shippingAddress.country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="couponCode">Code promo (optionnel)</Label>
                  <Input
                    id="couponCode"
                    {...register("couponCode")}
                    placeholder="EX : PROMO10"
                  />
                </div>

                {/* Badge Bitcoin */}
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
                  <span className="text-2xl">₿</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      Paiement en Bitcoin
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Un QR code et une adresse BTC vous seront fournis à
                      l&apos;étape suivante.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                  size="lg"
                  disabled={loading || syncing || !summary}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Création de la commande…
                    </span>
                  ) : (
                    "Continuer vers le paiement Bitcoin →"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── Récapitulatif ── */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold">Récapitulatif</h2>

          {syncing ? (
            <div className="space-y-3">
              {[80, 70, 60, 90].map((w, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : summary ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd>{formatPrice(summary.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Taxes</dt>
                <dd>{formatPrice(summary.tax)}</dd>
              </div>
              <div className="flex justify-between">
<<<<<<< HEAD
                <dt>Shipping</dt>
                <dd>{summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}</dd>

=======
                <dt className="text-muted-foreground">Livraison</dt>
                <dd>
                  {summary.shipping === 0
                    ? "Gratuite"
                    : formatPrice(summary.shipping)}
                </dd>
>>>>>>> d3493ad (fix:correction du raffraichissement e la page)
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Remise</dt>
                  <dd>− {formatPrice(summary.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="text-accent">{formatPrice(summary.total)}</dd>
              </div>
              <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                ₿ Le montant en BTC sera calculé au taux du marché à l&apos;étape
                suivante.
              </div>
            </dl>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-red-500">
                Panier vide.{" "}
                <a href="/cart" className="underline">
                  Retourner au panier
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}