"use client";

// src/views/site/HomeView.tsx
// Pachankaun landing — built on the Pehchaan design system. What the
// product is, how it works, and the single action: create your profile.
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock3, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const STEPS = [
  { titleKey: "home.steps.one.title", bodyKey: "home.steps.one.body" },
  { titleKey: "home.steps.two.title", bodyKey: "home.steps.two.body" },
  { titleKey: "home.steps.three.title", bodyKey: "home.steps.three.body" }
] as const;

export function HomeView() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const rise = reduceMotion ? {} : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }
      };
  const transitionWithShortDelay = reduceMotion ? undefined : { duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] as const };
  const transitionWithLongDelay = reduceMotion ? undefined : { duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div>
      {/* ——— Hero ——— */}
      <section className="px-5 pt-16 pb-12 text-center sm:px-8 sm:pt-24 sm:pb-16">
        <motion.h1
          {...rise}
          className="mx-auto max-w-3xl text-balance text-4xl leading-[1.1] font-semibold tracking-[-0.022em] sm:text-6xl"
        >
          {t("home.hero.title")}
        </motion.h1>
        <motion.p
          {...rise}
          transition={transitionWithShortDelay}
          className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-500 sm:text-lg"
        >
          {t("home.hero.subtitle")}
        </motion.p>
        <motion.div
          {...rise}
          transition={transitionWithLongDelay}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link href="/register" className="pk-btn pk-btn-primary px-7">
            {t("home.hero.cta")}
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/browse" className="pk-btn pk-btn-secondary px-7">
            {t("home.nav.browse")}
          </Link>
          <p className="text-xs text-ink-400">{t("home.hero.ctaNote")}</p>
        </motion.div>
      </section>

      {/* ——— Product stage: an illustrative profile card, the product itself ——— */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 28, scale: 0.99 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-(--radius-stage) bg-ink-50 p-3 shadow-(--shadow-ambient-3) sm:p-5">
            <ProfileCardMock />
          </div>
          <p className="mt-4 text-center text-xs text-ink-400">{t("home.mock.illustrative")}</p>
        </motion.div>
      </section>

      {/* ——— How it works ——— */}
      <section id="how" className="scroll-mt-16 border-y border-ink-100 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {t("home.steps.title")}
          </h2>
          <ol className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.titleKey} className="border-t-2 border-ink-950 pt-5">
                <h3 className="text-lg font-semibold tracking-tight">{t(step.titleKey)}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-500">
                  {t(step.bodyKey)}
                </p>
                <span className="pk-micro mt-4 inline-block">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Category-aware questions ——— */}
      <section id="categories" className="scroll-mt-16 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {t("home.category.title")}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500 sm:text-base">
              {t("home.category.body")}
            </p>
          </div>
          <div className="pk-card p-6 sm:p-8">
            <div className="space-y-7">
              <CategoryField
                label={t("home.category.groupRestaurant")}
                chips={[t("home.category.chip1"), t("home.category.chip2"), t("home.category.chip5")]}
                selected={[0, 1]}
              />
              <div className="border-t border-ink-100" />
              <CategoryField
                label={t("home.category.groupDoctor")}
                chips={[t("home.category.chip3"), t("home.category.chip4"), t("home.category.chip6")]}
                selected={[0]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Closing CTA ——— */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl rounded-(--radius-stage) bg-ink-950 px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            {t("home.cta.title")}
          </h2>
          <p className="mt-3 text-[15px] text-ink-300">{t("home.cta.body")}</p>
          <Link href="/register" className="pk-btn pk-btn-primary mt-8 px-8">
            {t("home.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** A small field group for the category-aware section */
function CategoryField({ label, chips, selected }: { label: string; chips: string[]; selected: number[] }) {
  return (
    <div>
      <p className="pk-micro">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip, i) => {
          const on = selected.includes(i);
          return (
            <span
              key={chip}
              className={`pk-chip cursor-default ${on ? "pk-chip-on" : "pk-chip-off"}`}
            >
              {on ? <Check className="size-3" /> : null}
              {chip}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** The illustrative profile card — the product's own UI, rendered honestly. */
function ProfileCardMock() {
  const { t } = useLanguage();
  return (
    <div className="overflow-hidden rounded-(--radius-card) bg-white text-left shadow-(--shadow-ambient-2)">
      <div className="h-24 bg-angaar-50 sm:h-28" />
      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-7 mb-3 flex items-end justify-between">
          <div className="flex size-14 items-center justify-center rounded-(--radius-card) border-4 border-white bg-angaar-100 text-lg font-semibold text-angaar-700 shadow-(--shadow-ambient-1)">
            श
          </div>
          <span className="pk-badge pk-badge-pending">
            <Clock3 className="size-3" />
            {t("home.mock.badge")}
          </span>
        </div>

        <h3 className="text-lg font-semibold tracking-tight">शर्मा मिठाई भंडार</h3>
        <p className="mt-0.5 text-sm text-ink-500">मिठाई दुकान · इंदौर</p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="font-medium text-ink-600">{t("home.mock.complete")}</span>
          <span className="font-semibold text-angaar-600">85%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-[85%] rounded-full bg-angaar-600" />
        </div>

        <ul className="mt-5 divide-y divide-ink-100 border-t border-ink-100 text-sm">
          <li className="flex items-center gap-3 py-2.5 text-ink-700">
            <Phone className="size-4 text-ink-400" />
            +91 98XXX XXXXX
          </li>
          <li className="flex items-center gap-3 py-2.5 text-ink-700">
            <Clock3 className="size-4 text-ink-400" />
            {t("home.mock.open")}
          </li>
          <li className="flex items-center gap-3 py-2.5 text-ink-700">
            <MapPin className="size-4 text-ink-400" />
            सचिवताराम नगर, इंदौर
          </li>
        </ul>
      </div>
    </div>
  );
}
