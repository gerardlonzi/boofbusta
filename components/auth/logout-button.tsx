"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/constants";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Déconnecté");
    router.push(ROUTES.home);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Déconnexion
    </Button>
  );
}
