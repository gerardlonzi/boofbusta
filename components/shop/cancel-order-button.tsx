"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Annuler cette commande ?")) return;
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "cancel" }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message ?? "Erreur");
      return;
    }
    toast.success("Commande annulée");
    router.refresh();
  }

  return (
    <Button variant="destructive" className="mt-4" onClick={handleCancel}>
      Annuler la commande
    </Button>
  );
}
