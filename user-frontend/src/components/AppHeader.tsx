"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { authStore, useAuthStore } from "@/store/auth.store";

// App header: slim translucent bar — brand, owner name, language, sign out.
export function AppHeader() {
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5 sm:px-8">
        {/* Brand tap returns to the business dashboard */}
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="pk-mark">प</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight">
              {t("common.appName")}
            </span>
            {user?.name ? (
              <span className="block truncate text-xs text-ink-500">{user.name}</span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={() => setLang(lang === "hi" ? "en" : "hi")} className="pk-lang">
            {t("common.languageName")}
          </button>
          <button
            type="button"
            aria-label={t("header.logout")}
            onClick={() => authStore.logout()}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-signal-danger-soft hover:text-signal-danger"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
