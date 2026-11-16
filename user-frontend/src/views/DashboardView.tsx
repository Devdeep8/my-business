"use client";

// src/views/DashboardView.tsx
// Owner home — on Pehchaan. The business profile at a glance: wide
// profile card left, status and links right.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Clock3,
  ExternalLink,
  Pencil,
  Plus
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { LinksCard } from "@/components/business/LinksCard";
import { MediaCard } from "@/components/business/MediaCard";
import {
  businessService,
  type Business,
  type BusinessLink,
  type BusinessMedia,
  type BusinessStatus
} from "@/services/business.service";

const STATUS_CLASS: Record<BusinessStatus, string> = {
  draft: "pk-badge-draft",
  pending_review: "pk-badge-pending",
  published: "pk-badge-published",
  rejected: "pk-badge-rejected"
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
  const [media, setMedia] = useState<BusinessMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mine = await businessService.getMine().catch(() => null);
      if (cancelled) return;
      setBusiness(mine);
      if (mine) {
        const [linkResult, mediaResult] = await Promise.all([
          businessService.listLinks().catch(() => ({ items: [] as BusinessLink[] })),
          businessService.listMedia().catch(() => ({ items: [] as BusinessMedia[] }))
        ]);
        if (!cancelled) {
          setLinks(linkResult.items);
          setMedia(mediaResult.items);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-angaar-600" />
      </div>
    );
  }

  // No profile yet — onboarding is the single primary action
  if (!business) {
    return (
      <div className="mx-auto w-full max-w-xl flex-1 px-5 py-16 sm:px-8">
        <div className="pk-card p-10 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-(--radius-card) bg-angaar-50 text-angaar-600">
            <Building2 className="size-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{t("business.emptyTitle")}</h1>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-ink-500">
            {t("business.emptyBody")}
          </p>
          <Link href="/onboarding" className="pk-btn pk-btn-primary mt-6 px-6">
            <Plus className="size-4" />
            {t("business.create")}
          </Link>
        </div>
      </div>
    );
  }

  const completeness = business.completenessScore ?? 0;
  const categoryName = business.primaryCategory
    ? (lang === "hi" ? business.primaryCategory.name_hi : business.primaryCategory.name_en)
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Profile card — the hero of this page */}
        <section className="pk-card overflow-hidden lg:col-span-2">
          <div className="h-24 bg-angaar-50 sm:h-28" />
          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-8 mb-4 flex items-end justify-between gap-3">
              <div className="flex size-16 items-center justify-center rounded-(--radius-card) border-4 border-white bg-angaar-100 text-2xl font-semibold text-angaar-700 shadow-(--shadow-ambient-1)">
                {business.name.trim().charAt(0) || <Building2 className="size-7" />}
              </div>
              <Link href="/onboarding" className="pk-btn pk-btn-secondary pk-btn-sm">
                <Pencil className="size-3.5" />
                {t("business.edit")}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{business.name}</h1>
              <span className={`pk-badge ${STATUS_CLASS[business.status]}`}>
                {business.status === "published"
                  ? <BadgeCheck className="size-3.5" />
                  : <Clock3 className="size-3.5" />}
                {t(STATUS_KEYS[business.status])}
              </span>
            </div>
            {categoryName ? (
              <p className="mt-1 text-[15px] text-ink-500">{categoryName}</p>
            ) : null}

            {business.description ? (
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-700">
                {business.description}
              </p>
            ) : null}

            {/* Completeness */}
            <div className="pk-panel mt-6 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">{t("business.completeness")}</span>
                <span className="font-semibold text-angaar-600">{completeness}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
                <div
                  className="h-full rounded-full bg-angaar-600 transition-all duration-500"
                  style={{ width: `${Math.max(completeness, 3)}%` }}
                />
              </div>
              {completeness < 100 ? (
                <Link href="/onboarding" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-angaar-600 hover:text-angaar-700 hover:underline underline-offset-4">
                  {t("business.completeProfile")}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              ) : null}
            </div>

            {/* Public URL */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-100 pt-4 text-sm">
              <span className="text-ink-500">
                {t("business.publicUrl")}{" "}
                <span className="font-medium text-ink-950">/{business.slug}</span>
              </span>
              {business.status === "published" ? (
                <a href={`/b/${business.slug}`} className="inline-flex items-center gap-1 font-medium text-angaar-600 hover:underline underline-offset-4">
                  {t("business.viewPublic")}
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* Side column — rejection note + links */}
        <div className="space-y-5">
          {business.status === "rejected" && business.rejectionReason ? (
            <div className="rounded-(--radius-card) bg-signal-danger-soft p-5">
              <p className="text-sm font-semibold text-signal-danger">{t("business.rejectedTitle")}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-signal-danger/90">
                {business.rejectionReason}
              </p>
              <Link href="/onboarding" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-signal-danger hover:underline">
                <Pencil className="size-3.5" />
                {t("business.edit")}
              </Link>
            </div>
          ) : null}

          <LinksCard links={links} onChange={setLinks} />
        </div>
      </div>
      <div className="mt-5">
        <MediaCard media={media} onChange={setMedia} />
      </div>
    </div>
  );
}
