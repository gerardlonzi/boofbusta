"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/constants";

interface LogoutButtonProps {
  isLoggedIn?: boolean;
}

export function LogoutButton({ isLoggedIn = true }: LogoutButtonProps) {
  const router = useRouter();

  if (!isLoggedIn) return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.push(ROUTES.home);
    router.refresh();
  }

  return (
    <Button variant="outline" className="bg-red-300 pointer" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
