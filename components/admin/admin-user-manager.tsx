"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AdminUserManagerProps {
  users: User[];
}

export function AdminUserManager({ users }: AdminUserManagerProps) {
  const router = useRouter();

  async function handleAction(id: string, action: string, role?: string) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Erreur");
      toast.success("Utilisateur mis à jour");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">Nom</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rôle</th>
            <th className="p-3">Statut</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.firstName} {u.lastName}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3"><Badge>{u.role}</Badge></td>
              <td className="p-3">{u.isActive ? "Actif" : "Inactif"}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(u.id, "toggleActive")}
                  >
                    {u.isActive ? "Désactiver" : "Activer"}
                  </Button>
                  {u.role === "CUSTOMER" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(u.id, "updateRole", "ADMIN")}
                    >
                      Promouvoir admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(u.id, "updateRole", "CUSTOMER")}
                    >
                      Rétrograder
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
