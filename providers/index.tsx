"use client";

import { Toaster } from "sonner";
import { SessionRefresh } from "@/components/auth/session-refresh";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SessionRefresh />
      <Toaster richColors position="top-right" />
    </>
  );
}
