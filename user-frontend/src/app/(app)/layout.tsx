"use client";

// src/app/(app)/layout.tsx
// Shell for every authenticated page: auth guard + header with language
// toggle and logout. Unauthenticated visitors land on /login.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrated, authenticated } = useAuthStore();

  useEffect(() => {
    if (hydrated && !authenticated) {
      router.replace("/login");
    }
  }, [hydrated, authenticated, router]);

  // Hold render until the session status is known (no login-page flash)
  if (!hydrated || !authenticated) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center text-ink-400">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <AppHeader />
      {children}
    </div>
  );
}
