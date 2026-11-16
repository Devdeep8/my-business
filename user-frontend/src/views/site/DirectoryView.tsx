"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { safeHttpUrl } from "@/lib/publicUrl";
import {
  publicBusinessService,
  type PublicBusinessCard,
  type PublicCategory,
  type PublicBusinessPage
} from "@/services/publicBusiness.service";

const flattenCategories = (items: PublicCategory[]): PublicCategory[] =>
  items.flatMap((item) => item.children?.length ? flattenCategories(item.children) : [item]);

export function DirectoryView({
  initialPage = null,
  initialCategories = []
}: {
  initialPage?: PublicBusinessPage | null;
  initialCategories?: PublicCategory[];
}) {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<PublicCategory[]>(initialCategories);
  const [businesses, setBusinesses] = useState<PublicBusinessCard[]>(initialPage?.items ?? []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialPage?.pagination.totalPages ?? 1);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);
  const skipFirstLoad = useRef(initialPage !== null);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    if (initialCategories.length) return;
    let cancelled = false;
    publicBusinessService.listCategories()
      .then((result) => { if (!cancelled) setCategories(result.items); })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, [initialCategories.length]);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      publicBusinessService.list({ page, limit: 12, search, category })
        .then((result) => {
          if (cancelled) return;
          setBusinesses(result.items);
          setTotalPages(Math.max(1, result.pagination.totalPages));
        })
        .catch(() => {
          if (cancelled) return;
          setBusinesses([]);
          setError(true);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, search ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [page, search, category]);

  const changeSearch = (value: string) => { setSearch(value); setPage(1); };
  const changeCategory = (value: string) => { setCategory(value); setPage(1); };

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <div className="max-w-2xl">
        <p className="pk-micro">{t("directory.eyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("directory.title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">{t("directory.subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
        <label className="relative">
          <span className="sr-only">{t("directory.search")}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
            placeholder={t("directory.searchPlaceholder")}
            className="pk-input pl-10"
          />
        </label>
        <label>
          <span className="sr-only">{t("directory.category")}</span>
          <select value={category} onChange={(event) => changeCategory(event.target.value)} className="pk-input">
            <option value="">{t("directory.allCategories")}</option>
            {categoryOptions.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name[lang] || item.name.en}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div role="alert" className="mt-8 rounded-xl border border-signal-danger/20 bg-signal-danger-soft p-4 text-sm text-signal-danger">
          {t("directory.loadError")}
        </div>
      ) : loading ? (
        <div className="flex min-h-64 items-center justify-center" aria-label={t("common.loading")}>
          <div className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-angaar-600" />
        </div>
      ) : businesses.length ? (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => <BusinessCard key={business.id} business={business} lang={lang} />)}
          </div>
          <nav className="mt-8 flex items-center justify-center gap-4" aria-label={t("directory.pagination")}>
            <button className="pk-btn pk-btn-secondary pk-btn-sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              {t("directory.previous")}
            </button>
            <span className="text-sm text-ink-500">{t("directory.page", { page, total: totalPages })}</span>
            <button className="pk-btn pk-btn-secondary pk-btn-sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              {t("directory.next")}
            </button>
          </nav>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">{t("directory.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-ink-500">{t("directory.emptyBody")}</p>
          <Link href="/register" className="pk-btn pk-btn-primary pk-btn-sm mt-5">{t("directory.addBusiness")}</Link>
        </div>
      )}
    </section>
  );
}

function BusinessCard({ business, lang }: { business: PublicBusinessCard; lang: "en" | "hi" }) {
  const { t } = useLanguage();
  const web = safeHttpUrl(business.website_url);
  return (
    <article className="pk-card overflow-hidden">
      {business.cover?.url ? (
        <div role="img" aria-label={business.cover.alt_text || business.name} className="h-36 bg-ink-100 bg-cover bg-center" style={{ backgroundImage: `url("${business.cover.url.replaceAll('"', "%22")}")` }} />
      ) : <div className="h-20 bg-angaar-50" />}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {business.logo?.url ? (
            <div role="img" aria-label={business.name} className="-mt-9 size-14 shrink-0 rounded-xl border-4 border-white bg-white bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("${business.logo.url.replaceAll('"', "%22")}")` }} />
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold tracking-tight">{business.name}</h2>
            <p className="mt-0.5 text-sm text-ink-500">
              {[business.category?.name[lang], business.city].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {business.description ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{business.description}</p> : null}
        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
          {web ? <span className="max-w-[55%] truncate text-xs text-ink-400">{new URL(web).hostname}</span> : <span />}
          <Link href={`/b/${business.slug}`} className="text-sm font-medium text-angaar-600 hover:underline underline-offset-4">
            {t("directory.viewProfile")}
          </Link>
        </div>
      </div>
    </article>
  );
}
