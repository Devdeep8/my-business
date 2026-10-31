"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-lg font-extrabold text-white shadow-sm"
          >
            प
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
            {t("common.appName")}
          </span>
        </Link>

        <nav aria-label={t("home.navForBusinesses")} className="hidden items-center gap-7 md:flex">
          <Link href="/#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-indigo-700">
            {t("home.navHowItWorks")}
          </Link>
          <Link href="/#for-businesses" className="text-sm font-semibold text-slate-600 hover:text-indigo-700">
            {t("home.navForBusinesses")}
          </Link>
        </nav>

        <Link
          href="/login"
          className="hidden min-h-10 shrink-0 items-center text-sm font-bold text-slate-600 hover:text-indigo-700 sm:flex"
        >
          {t("home.staffLogin")}
        </Link>
        <button
          type="button"
          onClick={() => setLang(lang === "hi" ? "en" : "hi")}
          className="flex min-h-10 shrink-0 items-center rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          {t("common.languageName")}
        </button>
        <Link
          href="/register"
          className="flex min-h-10 shrink-0 items-center rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          {t("home.navCreateProfile")}
        </Link>
      </div>
    </header>
  );
}
