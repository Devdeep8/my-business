"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HomeView() {
  const { t } = useLanguage();

  const steps = [
    { icon: Building2, title: t("home.step1Title"), description: t("home.step1Desc") },
    { icon: ClipboardCheck, title: t("home.step2Title"), description: t("home.step2Desc") },
    { icon: Sparkles, title: t("home.step3Title"), description: t("home.step3Desc") },
  ];

  const profileDetails = [
    t("home.profileDetail1"),
    t("home.profileDetail2"),
    t("home.profileDetail3"),
  ];

  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <section className="relative isolate bg-linear-to-br from-indigo-50 via-white to-violet-50">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-36 -top-32 -z-10 size-96 rounded-full bg-indigo-100/70 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="size-4" aria-hidden />
              {t("home.heroEyebrow")}
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
              <span className="mt-2 block bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t("home.heroHighlight")}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              {t("home.heroSub")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                {t("home.heroCta")}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-base font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                {t("home.heroSecondary")}
              </a>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{t("home.heroNote")}</p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-indigo-200/50 blur-2xl" aria-hidden />
            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-indigo-950/10 sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-bold text-slate-900">{t("home.previewTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">{t("home.previewSub")}</p>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Search className="size-5" aria-hidden />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-500">
                  <Building2 className="size-4 text-indigo-500" aria-hidden />
                  {t("home.previewCategory")}
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-500">
                  <MapPin className="size-4 text-indigo-500" aria-hidden />
                  {t("home.previewLocation")}
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-800">
                  <Sparkles className="size-4" aria-hidden />
                  {t("home.previewMatch")}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Building2 className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{t("home.previewBusiness")}</p>
                    <p className="mt-1 text-sm text-slate-500">{t("home.previewBusinessSub")}</p>
                  </div>
                  <Check className="size-5 shrink-0 text-emerald-600" aria-hidden />
                </div>
              </div>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                {t("home.previewNote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              {t("home.stepsEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {t("home.stepsTitle")}
            </h2>
            <p className="mt-4 text-lg leading-7 text-slate-600">{t("home.stepsSub")}</p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="for-businesses" className="scroll-mt-24 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">
              {t("home.discoveryEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {t("home.discoveryTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{t("home.discoverySub")}</p>
            <Link
              href="/register"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 text-base font-bold text-white transition hover:bg-indigo-700"
            >
              {t("home.discoveryCta")}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
            {profileDetails.map((detail) => (
              <li key={detail} className="flex gap-3 py-5 text-base font-medium leading-7 text-slate-700">
                <Check className="mt-1 size-5 shrink-0 text-emerald-600" aria-hidden />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center rounded-3xl bg-linear-to-br from-indigo-600 to-violet-700 px-6 py-12 text-center text-white shadow-xl shadow-indigo-900/15 sm:px-12 sm:py-16">
          <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("home.finalTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-indigo-100">{t("home.finalSub")}</p>
          <Link
            href="/register"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            {t("home.finalCta")}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
