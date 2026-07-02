"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

interface AdminCouponManagerProps {
  coupons: Coupon[];
}

export function AdminCouponManager({ coupons: initial }: AdminCouponManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minPurchase: "",
    maxUses: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ code: "", type: "PERCENTAGE", value: "", minPurchase: "", maxUses: "", isActive: true });
    setShowForm(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minPurchase: c.minPurchase ? String(c.minPurchase) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      isActive: c.isActive,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        isActive: form.isActive,
      };
      const url = "/api/coupons";
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...payload } : payload;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success("Coupon deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Add Coupon</Button>
      </div>

      <div className="space-y-3">
        {initial.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-800">
            <div>
              <p className="font-mono font-medium">{c.code}</p>
              <p className="text-sm text-zinc-500">
                {c.type} — {c.value}{c.type === "PERCENTAGE" ? "%" : "$"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              <span className="text-sm">{c.usedCount}/{c.maxUses ?? "∞"}</span>
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(c.id)} className="text-red-600">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{editing ? "Edit Coupon" : "New Coupon"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required disabled={!!editing} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min. purchase</Label>
                  <Input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} />
                </div>
                <div>
                  <Label>Max uses</Label>
                  <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
