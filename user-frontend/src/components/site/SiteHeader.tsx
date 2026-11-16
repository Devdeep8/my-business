"use client";

// Public site header: slim, translucent, quiet. Brand left, anchor links +
// language + auth actions right.
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={t("common.appName")}>
          <span className="pk-mark">प</span>
          <span className="text-[15px] font-semibold tracking-tight">{t("common.appName")}</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Site">
          <Link href="/#how" className="pk-navlink">{t("home.nav.how")}</Link>
          <Link href="/#categories" className="pk-navlink">{t("home.nav.categories")}</Link>
          <Link href="/browse" className="pk-navlink">{t("home.nav.browse")}</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={() => setLang(lang === "hi" ? "en" : "hi")} className="pk-lang">
            {t("common.languageName")}
          </button>
          <Link href="/login" className="pk-navlink">
            {t("home.signIn")}
          </Link>
          <Link href="/register" className="pk-btn pk-btn-primary pk-btn-sm hidden sm:inline-flex">
            {t("home.addBusiness")}
          </Link>
        </div>
      </div>
    </header>
  );
}
