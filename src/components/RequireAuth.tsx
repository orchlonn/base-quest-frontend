"use client";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Allow Zustand persist to rehydrate before deciding.
    const t = setTimeout(() => {
      if (!token) router.replace("/login");
      else setReady(true);
    }, 50);
    return () => clearTimeout(t);
  }, [token, router]);

  if (!ready) {
    return (
      <div className="grid place-items-center py-32 opacity-60">Loading your session…</div>
    );
  }
  return <>{children}</>;
}
