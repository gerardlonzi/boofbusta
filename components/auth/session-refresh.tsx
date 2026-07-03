"use client";

import { useEffect } from "react";

export function SessionRefresh() {
  useEffect(() => {
    async function refreshSession() {
      try {
        await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
      } catch {
        // Ignore refresh failures — user may be logged out
      }
    }

    refreshSession();
    const interval = setInterval(refreshSession, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
