"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/image-upload";
import { slugify } from "@/lib/utils";
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
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  console.log("categories " + initial);

  const previewSlug = slugify(slug || name);

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setImages([]);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setImages(cat.image ? [cat.image] : []);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        slug: slug || name,
        description: description || null,
        image: images[0] ?? null,
      };
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success(editing ? "Category updated" : "Category created");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, productCount: number) {
    if (productCount > 0) {
      toast.error("Cannot delete a category that has products");
      return;
    }
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Something went wrong");
      toast.success("Category deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      <div className="space-y-3">
        {initial.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted">
            No categories yet. Create your first category to organize products.
          </p>
        )}
        {initial.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-800">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-zinc-500">
                {cat._count.products} products · /shop/category/{cat.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(cat.id, cat._count.products)} className="text-red-600">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{editing ? "Edit Category" : "New Category"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>URL Slug (optional)</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. shroom-drug or shroom drug"
                />
                <p className="mt-1 text-xs text-muted">
                  Preview: /shop/category/{previewSlug || "your-category"}
                </p>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <ImageUpload
                label="Category Image"
                images={images}
                onChange={setImages}
                folder="categories"
                multiple={false}
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
