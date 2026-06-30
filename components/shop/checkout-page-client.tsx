"use client";

import { useEffect, useState } from "react";
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
import { calculateCartTotals } from "@/lib/commerce/totals";
import { useCartStore } from "@/store/cart-store";
import { syncGuestDataOnLogin } from "@/hooks/use-guest-commerce";

const stripeEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function CheckoutPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [summary, setSummary] = useState<{ subtotal: number; tax: number; shipping: number; total: number } | null>(null);
  const zustandItems = useCartStore((s) => s.items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: "standard" as const,
      shippingAddress: {
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        postalCode: "",
        country: "FR",
      },
    },
  });

  useEffect(() => {
    async function syncCart() {
      try {
        await syncGuestDataOnLogin();
        const res = await fetch("/api/cart");
        if (res.ok) {
          const json = await res.json();
          const items = json.data.cart.items;
          if (items.length === 0 && zustandItems.length > 0) {
            for (const item of zustandItems) {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
              });
            }
            const retry = await fetch("/api/cart");
            if (retry.ok) {
              const retryJson = await retry.json();
              setSummary(retryJson.data.cart.totals);
            }
          } else {
            setSummary(json.data.cart.totals);
          }
        } else if (zustandItems.length > 0) {
          setSummary(calculateCartTotals(zustandItems.map((i) => ({ price: i.price, quantity: i.quantity }))));
        }
      } catch {
        if (zustandItems.length > 0) {
          setSummary(calculateCartTotals(zustandItems.map((i) => ({ price: i.price, quantity: i.quantity }))));
        }
      } finally {
        setSyncing(false);
      }
    }
    syncCart();
  }, [zustandItems]);

  async function onSubmit(data: CheckoutInput) {
    setLoading(true);
    try {
      await syncGuestDataOnLogin();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Erreur");

      if (json.data.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
      } else {
        useCartStore.getState().clearCart();
        toast.success("Commande confirmée");
        router.push(`/checkout/success?order=${json.data.order.orderNumber}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      {!stripeEnabled && (
        <p className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          Mode démo : paiement désactivé. La commande sera confirmée sans paiement en ligne.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <Input {...register("shippingAddress.firstName")} />
                    {errors.shippingAddress?.firstName && (
                      <p className="text-sm text-red-600">{errors.shippingAddress.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input {...register("shippingAddress.lastName")} />
                  </div>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input {...register("shippingAddress.street")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ville</Label>
                    <Input {...register("shippingAddress.city")} />
                  </div>
                  <div>
                    <Label>Code postal</Label>
                    <Input {...register("shippingAddress.postalCode")} />
                  </div>
                </div>
                <div>
                  <Label>Pays</Label>
                  <Input {...register("shippingAddress.country")} />
                </div>
                <div>
                  <Label>Code promo (optionnel)</Label>
                  <Input {...register("couponCode")} />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading || syncing}>
                  {loading ? "Traitement..." : stripeEnabled ? "Payer avec Stripe" : "Confirmer la commande"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold">Récapitulatif</h2>
          {syncing ? (
            <p className="text-sm text-muted">Chargement...</p>
          ) : summary ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd>{formatPrice(summary.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>TVA</dt>
                <dd>{formatPrice(summary.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Livraison</dt>
                <dd>{summary.shipping === 0 ? "Gratuite" : formatPrice(summary.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="text-accent">{formatPrice(summary.total)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-red-500">Panier vide. <a href="/cart" className="underline">Retour au panier</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
