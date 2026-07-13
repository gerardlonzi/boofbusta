"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/image-upload";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  status: string;
  description: string;
  categoryId: string;
  brand: string | null;
  tags: string[];
  featured: boolean;
  images: string[];
  category: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface AdminProductManagerProps {
  products: Product[];
  categories: Category[];
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "0",
  sku: "",
  categoryId: "",
  brand: "",
  tags: "",
  status: "ACTIVE" as const,
  featured: false,
};

export function AdminProductManager({ products: initial, categories }: AdminProductManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setImages([]);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      stock: String(p.stock),
      sku: p.sku,
      categoryId: p.categoryId,
      brand: p.brand ?? "",
      tags: p.tags.join(", "),
      status: p.status as "ACTIVE",
      featured: p.featured,
    });
    setImages(p.images);
    setShowForm(true);
  }

  function buildPayload() {
    return {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      sku: form.sku,
      categoryId: form.categoryId,
      brand: form.brand || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: form.status,
      featured: form.featured,
      images,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildPayload();
      const url = editing ? `/api/products/${editing.slug}` : "/api/products";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success(editing ? "Product updated" : "Product created");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success("Product deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Add Product</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Category</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><Badge>{p.status}</Badge></td>
                <td className="p-3">{p.category?.name ?? "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(p.slug)} className="text-red-600">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{editing ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}  />
                </div>
                <div>
                  <Label>Compare Price</Label>
                  <Input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}  disabled={!!editing} />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Featured Product</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.featured ? "true" : "false"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured: e.target.value === "true",
                    })
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <ImageUpload
                label="Product Images"
                images={images}
                onChange={setImages}
                folder="products"
              />
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
