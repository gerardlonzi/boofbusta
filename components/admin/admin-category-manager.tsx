"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
}

interface AdminCategoryManagerProps {
  categories: Category[];
}

export function AdminCategoryManager({ categories: initial }: AdminCategoryManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setImage("");
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImage(cat.image ?? "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, description: description || null, image: image || null };
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Erreur");
      toast.success(editing ? "Catégorie modifiée" : "Catégorie créée");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, productCount: number) {
    if (productCount > 0) {
      toast.error("Impossible de supprimer une catégorie avec des produits");
      return;
    }
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Erreur");
      toast.success("Catégorie supprimée");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Ajouter une catégorie</Button>
      </div>

      <div className="space-y-3">
        {initial.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-800">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-zinc-500">{cat._count.products} produits · {cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>Modifier</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(cat.id, cat._count.products)} className="text-red-600">Supprimer</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Image (URL)</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "..." : "Enregistrer"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
