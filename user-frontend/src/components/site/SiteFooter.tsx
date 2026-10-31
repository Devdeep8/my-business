"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
              {t("common.appName")}
            </Link>
            <p className="mt-1 text-sm text-slate-400">{t("home.footerNote")}</p>
          </div>
          <nav aria-label={t("home.navForBusinesses")} className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/#how-it-works" className="text-sm font-semibold text-slate-300 hover:text-white">
              {t("home.navHowItWorks")}
            </Link>
            <Link href="/#for-businesses" className="text-sm font-semibold text-slate-300 hover:text-white">
              {t("home.navForBusinesses")}
            </Link>
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white">
              {t("home.staffLogin")}
            </Link>
            <Link href="/register" className="text-sm font-semibold text-indigo-300 hover:text-white">
              {t("home.navCreateProfile")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
