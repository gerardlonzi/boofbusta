"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUSES = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
] as const;

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();

  async function handleChange(status: string) {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "updateStatus", status }),
    });
    if (!res.ok) {
      toast.error("Erreur lors de la mise à jour");
      return;
    }
    toast.success("Statut mis à jour");
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
