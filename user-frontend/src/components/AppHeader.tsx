"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { authStore, useAuthStore } from "@/store/auth.store";

// App header: brand monogram, owner greeting, UI language pill and logout —
// frosted-glass sticky bar over the slate canvas.
export function AppHeader() {
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex min-h-16 max-w-3xl items-center gap-3 px-4 py-2">
        {/* Brand tap returns to the business dashboard */}
        <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-md shadow-indigo-200">
            प
          </span>
          <span className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-slate-900">{t("common.appName")}</p>
            {user?.name ? <p className="truncate text-xs text-slate-500">{user.name}</p> : null}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setLang(lang === "hi" ? "en" : "hi")}
          className="flex min-h-9 shrink-0 items-center rounded-full border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          {t("common.languageName")}
        </button>

        <button
          type="button"
          aria-label={t("header.logout")}
          onClick={() => authStore.logout()}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
