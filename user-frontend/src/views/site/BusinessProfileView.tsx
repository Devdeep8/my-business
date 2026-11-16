"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock3, ExternalLink, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { formatPhone, mapHref, safeHttpUrl, telHref, waHref, type AddressLike } from "@/lib/publicUrl";
import { publicBusinessService, type PublicBusinessProfile } from "@/services/publicBusiness.service";

const printable = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(printable).filter(Boolean).join(", ");
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).map(printable).filter(Boolean).join(" · ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === null || value === undefined ? "" : String(value);
};

export function BusinessProfileView({
  slug,
  initialBusiness = null
}: {
  slug: string;
  initialBusiness?: PublicBusinessProfile | null;
}) {
  const { t, lang } = useLanguage();
  const [business, setBusiness] = useState<PublicBusinessProfile | null>(initialBusiness);
  const [loading, setLoading] = useState(initialBusiness === null);
  const [failed, setFailed] = useState(false);
  const skipFirstLoad = useRef(initialBusiness !== null);

  useEffect(() => {
    if (skipFirstLoad.current) {
      skipFirstLoad.current = false;
      return;
    }
    setLoading(true);
    setFailed(false);
    setBusiness(null);
    let cancelled = false;
    setLoading(true);
    publicBusinessService.get(slug)
      .then((result) => { if (!cancelled) setBusiness(result); })
      .catch(() => { if (!cancelled) { setBusiness(null); setFailed(true); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center py-24"><div className="size-7 animate-spin rounded-full border-2 border-ink-200 border-t-angaar-600" /></div>;
  }
  if (failed || !business) {
    return (
      <section className="mx-auto w-full max-w-2xl flex-1 px-5 py-16 text-center sm:px-8">
        <h1 className="text-2xl font-semibold">{t("profile.notFound")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("profile.notFoundBody")}</p>
        <Link href="/browse" className="pk-btn pk-btn-primary mt-6"><ArrowLeft className="size-4" />{t("profile.backToDirectory")}</Link>
      </section>
    );
  }

  const address = business.address as AddressLike | null;
  const addressText = [address?.line1, address?.line2, address?.city, address?.district, address?.state, address?.pincode]
    .filter((part): part is string => Boolean(part?.trim())).join(", ");
  const website = safeHttpUrl(business.website_url);
  const directions = mapHref(business.name, address);
  const phone = formatPhone(business.phone);
  const whatsappNumber = business.whatsapp || business.phone;
  const photos = business.media.filter((item) => item.kind === "photo" || item.kind === "cover");

  return (
    <article className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-950">
        <ArrowLeft className="size-4" />{t("profile.backToDirectory")}
      </Link>

      <section className="pk-card mt-5 overflow-hidden">
        {business.media.find((item) => item.kind === "cover") ? (
          <div role="img" aria-label={business.media.find((item) => item.kind === "cover")?.alt_text || business.name} className="h-44 bg-ink-100 bg-cover bg-center sm:h-60" style={{ backgroundImage: `url("${business.media.find((item) => item.kind === "cover")?.url.replaceAll('"', "%22")}")` }} />
        ) : <div className="h-28 bg-angaar-50 sm:h-36" />}
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
            {business.media.find((item) => item.kind === "logo") ? (
              <div role="img" aria-label={`${business.name} logo`} className="size-16 rounded-2xl border-4 border-white bg-white bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("${business.media.find((item) => item.kind === "logo")?.url.replaceAll('"', "%22")}")` }} />
            ) : <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-white bg-angaar-100 text-2xl font-semibold text-angaar-700">{business.name.charAt(0)}</div>}
            {business.verification_status === "verified" ? <span className="pk-badge pk-badge-published"><BadgeCheck className="size-3.5" />{t("profile.verified")}</span> : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{business.name}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {[business.category?.name[lang], address?.city].filter(Boolean).join(" · ")}
          </p>
          {business.description ? <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-700">{business.description}</p> : null}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href={telHref(business.phone)} className="pk-btn pk-btn-primary"><Phone className="size-4" />{t("profile.call")}</a>
            <a href={waHref(whatsappNumber, t("profile.whatsappMessage", { name: business.name }))} target="_blank" rel="noopener noreferrer" className="pk-btn pk-btn-secondary">{t("profile.whatsapp")}</a>
            {website ? <a href={website} target="_blank" rel="noopener noreferrer" className="pk-btn pk-btn-secondary"><ExternalLink className="size-4" />{t("profile.website")}</a> : null}
            {directions ? <a href={directions} target="_blank" rel="noopener noreferrer" className="pk-btn pk-btn-secondary"><MapPin className="size-4" />{t("profile.directions")}</a> : null}
          </div>
          <p className="mt-3 text-sm text-ink-500">{phone}</p>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          {business.profile_fields.length ? (
            <section className="pk-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">{t("profile.details")}</h2>
              <dl className="mt-4 divide-y divide-ink-100">
                {business.profile_fields.map((field) => (
                  <div key={field.key} className="grid gap-1 py-3 sm:grid-cols-[minmax(140px,0.7fr)_1fr] sm:gap-4">
                    <dt className="text-sm text-ink-500">{field.label[lang] || field.label.en}</dt>
                    <dd className="text-sm font-medium text-ink-800">{printable(field.value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {photos.length ? (
            <section className="pk-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">{t("profile.photos")}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((item) => (
                  <div key={`${item.url}-${item.kind}`} role="img" aria-label={item.alt_text || business.name} className="aspect-square rounded-xl bg-ink-100 bg-cover bg-center" style={{ backgroundImage: `url("${item.url.replaceAll('"', "%22")}")` }} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          {addressText ? (
            <section className="pk-card p-5">
              <h2 className="text-sm font-semibold">{t("profile.location")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{addressText}</p>
              {directions ? <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-angaar-600 hover:underline"><MapPin className="size-3.5" />{t("profile.directions")}</a> : null}
            </section>
          ) : null}
          {business.service_area || business.opening_date ? (
            <section className="pk-card p-5">
              <dl className="space-y-3">
                {business.service_area ? <div><dt className="text-xs text-ink-400">{t("profile.serviceArea")}</dt><dd className="mt-1 text-sm text-ink-700">{printable(business.service_area)}</dd></div> : null}
                {business.opening_date ? <div><dt className="text-xs text-ink-400">{t("profile.opened")}</dt><dd className="mt-1 text-sm text-ink-700">{business.opening_date}</dd></div> : null}
              </dl>
            </section>
          ) : null}
          {business.hours && Object.keys(business.hours).length ? (
            <section className="pk-card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-ink-400" />{t("profile.hours")}</h2>
              <dl className="mt-3 space-y-2">
                {Object.entries(business.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-3 text-sm">
                    <dt className="capitalize text-ink-500">{day.replaceAll("_", " ")}</dt>
                    <dd className="text-right text-ink-800">{printable(hours)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {business.links.some((item) => safeHttpUrl(item.url)) ? (
            <section className="pk-card p-5">
              <h2 className="text-sm font-semibold">{t("profile.links")}</h2>
              <ul className="mt-2 divide-y divide-ink-100">
                {business.links.map((item) => {
                  const href = safeHttpUrl(item.url);
                  return href ? <li key={`${item.type}-${item.url}`}><a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium text-angaar-600 hover:underline"><span className="truncate">{item.title}</span><ExternalLink className="size-3.5 shrink-0" /></a></li> : null;
                })}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
