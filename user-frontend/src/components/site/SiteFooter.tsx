"use client";

// Public site footer: hairline, quiet, minimal.
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-ink-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:px-8">
        <p className="flex items-center gap-2.5">
          <span className="pk-mark">प</span>
          {t("common.appName")} · {t("home.footer.tagline")}
        </p>
        <nav className="flex items-center gap-5 sm:ml-auto" aria-label="Footer">
          <Link href="/browse" className="transition-colors hover:text-ink-950">
            {t("home.nav.browse")}
          </Link>
          <Link href="/login" className="transition-colors hover:text-ink-950">
            {t("home.footer.signIn")}
          </Link>
          <Link href="/register" className="transition-colors hover:text-ink-950">
            {t("home.footer.create")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
