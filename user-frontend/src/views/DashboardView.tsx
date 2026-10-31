"use client";

// src/views/DashboardView.tsx
// Owner home: business profile card with status, completeness ring and
// quick actions. Replaces the old crusher order book.
import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Building2, Clock3, Pencil, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  businessService,
  type Business,
  type BusinessLink,
  type BusinessStatus
} from "@/services/business.service";

const STATUS_STYLES: Record<BusinessStatus, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  pending_review: "bg-sky-50 text-sky-700 border-sky-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200"
};

const STATUS_KEYS: Record<BusinessStatus, string> = {
  draft: "business.statusDraft",
  pending_review: "business.statusPending",
  published: "business.statusPublished",
  rejected: "business.statusRejected"
};

export function DashboardView() {
  const { t, lang } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [links, setLinks] = useState<BusinessLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mine = await businessService.getMine().catch(() => null);
      if (cancelled) return;
      setBusiness(mine);
      if (mine) {
        const result = await businessService.listLinks().catch(() => ({ items: [] as BusinessLink[] }));
        if (!cancelled) setLinks(result.items);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
      </div>
    );
  }

  // No profile yet — onboarding is the single primary action
  if (!business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Building2 className="size-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t("business.emptyTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            {t("business.emptyBody")}
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-400 hover:to-violet-500"
          >
            <Plus className="size-4" />
            {t("business.create")}
          </Link>
        </div>
      </div>
    );
  }

  const completeness = business.completeness_score ?? 0;
  const categoryName = business.primaryCategory
    ? (lang === "hi" ? business.primaryCategory.name_hi : business.primaryCategory.name_en)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      {/* Profile card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-white bg-indigo-50 text-2xl text-indigo-600 shadow-md">
              <Building2 className="size-7" />
            </div>
            <Link
              href="/onboarding"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil className="size-3.5" />
              {t("business.edit")}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{business.name}</h1>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[business.status]}`}>
              {business.status === "published" ? <BadgeCheck className="size-3.5" /> : <Clock3 className="size-3.5" />}
              {t(STATUS_KEYS[business.status])}
            </span>
          </div>
          {categoryName ? (
            <p className="mt-0.5 text-sm text-slate-500">{categoryName}</p>
          ) : null}

          {/* Completeness */}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{t("business.completeness")}</span>
              <span className="font-bold text-indigo-600">{completeness}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${Math.max(completeness, 3)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rejection reason */}
      {business.status === "rejected" && business.rejection_reason ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">{t("business.rejectedTitle")}</p>
          <p className="mt-1 text-sm text-red-600">{business.rejection_reason}</p>
        </div>
      ) : null}

      {/* Links */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          {t("business.links")}
        </h2>
        {links.length === 0 ? (
          <p className="text-sm text-slate-400">{t("business.noLinks")}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-between gap-3 py-2 transition hover:text-indigo-600"
                >
                  <span className="truncate text-sm font-medium text-slate-700">{link.title}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {link.type}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="pb-4 text-center text-xs text-slate-400">
        {t("business.publicUrl")} <span className="font-mono text-slate-500">/{business.slug}</span>
      </p>
    </div>
  );
}
