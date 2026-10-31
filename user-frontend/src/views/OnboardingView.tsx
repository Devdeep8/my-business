"use client";

// src/views/OnboardingView.tsx
// Category-driven business onboarding, Google-Business-Profile style:
// 1) basics (name, phone, description)  2) pick a leaf category
// 3) fill THAT category's schema-driven form (fields come from the DB)
// 4) review and submit for admin review.
// Every category-specific question is rendered dynamically — nothing here
// knows what a "restaurant" or "doctor" is.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, Loader2, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { DynamicField, fieldLabel } from "@/components/form/DynamicField";
import {
  businessService,
  type CategoryForm,
  type CategoryNode,
  type Business
} from "@/services/business.service";

type Step = "basics" | "category" | "form" | "review";

const STEPS: { key: Step; titleKey: string }[] = [
  { key: "basics", titleKey: "onboarding.steps.basics" },
  { key: "category", titleKey: "onboarding.steps.category" },
  { key: "form", titleKey: "onboarding.steps.form" },
  { key: "review", titleKey: "onboarding.steps.review" }
];

export function OnboardingView() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<Step>("basics");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1 — basics
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [description, setDescription] = useState("");

  // Step 2 — category
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Step 3 — category form
  const [form, setForm] = useState<CategoryForm | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, unknown>>({});

  // Existing business → jump straight to its edit/submit state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [existing, categories] = await Promise.all([
        businessService.getMine(),
        businessService.listCategories().then((r) => r.items).catch(() => [])
      ]);
      if (cancelled) return;
      setTree(categories);
      setTreeLoading(false);

      if (existing) {
        // Owner already onboarded: prefill and show review step
        setName(existing.name);
        setPhone(existing.phone);
        setDescription(existing.description || "");
        setCategoryId(existing.primary_category_id);
        setAttributes(existing.attributes || {});
        setStep("review");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the category's schema-driven form when one is picked
  useEffect(() => {
    if (step !== "form" || !categoryId || form) return;
    let cancelled = false;
    setFormLoading(true);
    businessService
      .getCategoryForm(categoryId)
      .then((result) => {
        if (!cancelled) setForm(result);
      })
      .catch(() => {
        if (!cancelled) setErrors([t("onboarding.errors.formLoad")]);
      })
      .finally(() => {
        if (!cancelled) setFormLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, categoryId, form, t]);

  const categoryName = useMemo(() => {
    if (!categoryId) return null;
    const find = (nodes: CategoryNode[]): CategoryNode | null => {
      for (const node of nodes) {
        if (node.id === categoryId) return node;
        const child = node.children ? find(node.children) : null;
        if (child) return child;
      }
      return null;
    };
    const found = find(tree);
    return found ? found[`name_${lang}`] || found.name_en : null;
  }, [categoryId, tree, lang]);

  // Conditional visibility: show a field only when its visible_if matches
  const visibleFields = useMemo(() => {
    if (!form) return [];
    return form.fields.filter((field) => {
      const cond = field.visible_if;
      if (!cond) return true;
      return attributes[cond.field] === cond.equals;
    });
  }, [form, attributes]);

  const setAttribute = (key: string, value: unknown) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateBasics = () => {
    const errs: string[] = [];
    if (name.trim().length < 2) errs.push(t("onboarding.errors.name"));
    if (!/^\+91[0-9]{10}$/.test(phone.trim())) errs.push(t("onboarding.errors.phone"));
    setErrors(errs);
    return errs.length === 0;
  };

  // Client-side mirror of the server's attribute validation so the owner
  // sees problems per-field before submit
  const validateAttributes = () => {
    const errs: Record<string, string> = {};
    for (const field of visibleFields) {
      const value = attributes[field.key];
      const empty =
        value === null || value === undefined || value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        if (field.validation?.required) errs[field.key] = t("onboarding.errors.required");
        continue;
      }
      if (field.type === "url" && !/^https?:\/\/.+/.test(String(value))) {
        errs[field.key] = t("onboarding.errors.url");
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validateAttributes()) return;
    setSaving(true);
    setErrors([]);
    try {
      let business: Business | null = await businessService.getMine();
      if (!business && categoryId) {
        business = await businessService.create({
          name: name.trim(),
          primaryCategoryId: categoryId,
          phone: phone.trim(),
          description: description.trim() || undefined,
          attributes
        });
      } else if (business) {
        business = await businessService.update({
          name: name.trim(),
          phone: phone.trim(),
          description: description.trim(),
          attributes
        });
      }
      if (business && business.status === "draft") {
        await businessService.submit();
      }
      router.push("/dashboard");
    } catch (error) {
      const message = (error as Error).message || t("onboarding.errors.submit");
      setErrors([message]);
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      {/* Progress */}
      <ol className="flex items-center gap-1.5" aria-label={t("onboarding.progress")}>
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex flex-1 items-center gap-1.5">
            <span
              className={`h-2 flex-1 rounded-full ${i <= stepIndex ? "bg-indigo-600" : "bg-slate-200"}`}
              aria-current={i === stepIndex ? "step" : undefined}
            />
          </li>
        ))}
      </ol>

      {errors.length > 0 ? (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3 space-y-1" role="alert">
          {errors.map((error) => (
            <p key={error} className="text-sm font-medium text-red-700">{error}</p>
          ))}
        </div>
      ) : null}

      {/* Step 1 — basics */}
      {step === "basics" ? (
        <section className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <h1 className="text-xl font-bold text-slate-900">{t("onboarding.steps.basics")}</h1>
          <div className="space-y-1.5">
            <label htmlFor="biz-name" className="block text-base font-bold text-slate-800">
              {t("onboarding.name")}<span className="ml-1 text-indigo-600">*</span>
            </label>
            <Input id="biz-name" value={name} className="border-slate-300"
              onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="biz-phone" className="block text-base font-bold text-slate-800">
              {t("onboarding.phone")}<span className="ml-1 text-indigo-600">*</span>
            </label>
            <Input id="biz-phone" inputMode="tel" value={phone} className="border-slate-300"
              onChange={(e) => setPhone(e.target.value)} />
            <p className="text-sm text-slate-500">+91 XXXXXXXXXX</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="biz-desc" className="block text-base font-bold text-slate-800">
              {t("onboarding.description")}
              <span className="ml-2 text-sm font-normal text-slate-400">(optional)</span>
            </label>
            <textarea id="biz-desc" rows={3} value={description}
              className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-base"
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button
            type="button"
            className="h-12 w-full rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-400 hover:to-violet-500 active:scale-[0.99]"
            onClick={() => {
              if (validateBasics()) setStep("category");
            }}
          >
            {t("common.next")}
          </button>
        </section>
      ) : null}

      {/* Step 2 — category picker */}
      {step === "category" ? (
        <section className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={t("common.back")}
              className="flex min-h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300"
              onClick={() => setStep("basics")}>
              <ChevronLeft className="size-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{t("onboarding.steps.category")}</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <Input value={search} className="border-slate-300 pl-10"
              placeholder={t("onboarding.searchCategory")}
              onChange={(e) => setSearch(e.target.value)} />
          </div>

          {treeLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="size-8 animate-spin text-slate-400" /></div>
          ) : (
            <ul className="divide-y-2 divide-slate-100">
              {tree
                .filter((node) =>
                  !search.trim() ||
                  `${node.name_en} ${node.name_hi}`.toLowerCase().includes(search.trim().toLowerCase())
                )
                .map((node) => (
                  <li key={node.id}>
                    {node.children && node.children.length > 0 ? (
                      <button
                        type="button"
                        aria-expanded={expanded === node.id}
                        className="flex min-h-14 w-full items-center justify-between px-1 text-left text-lg font-bold text-slate-800"
                        onClick={() => setExpanded(expanded === node.id ? null : node.id)}
                      >
                        {node[`name_${lang}`] || node.name_en}
                        <span className="text-slate-400">{expanded === node.id ? "−" : "+"}</span>
                      </button>
                    ) : null}
                    {(node.children && node.children.length > 0 ? expanded === node.id : true) ? (
                      <ul className="pb-2 pl-3">
                        {(node.children && node.children.length > 0
                          ? node.children
                          : [node]
                        ).map((leaf) => (
                          <li key={leaf.id}>
                            <button
                              type="button"
                              aria-pressed={categoryId === leaf.id}
                              className={`mt-1 flex min-h-12 w-full items-center justify-between rounded-xl border-2 px-3 text-left text-base font-bold ${
                                categoryId === leaf.id
                                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                              onClick={() => setCategoryId(leaf.id)}
                            >
                              {leaf[`name_${lang}`] || leaf.name_en}
                              {categoryId === leaf.id ? <CheckCircle2 className="size-5 text-indigo-600" /> : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
            </ul>
          )}

          <button
            type="button" disabled={!categoryId}
            className="h-12 w-full rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-400 hover:to-violet-500 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            onClick={() => {
              setForm(null);
              setStep("form");
            }}
          >
            {t("common.next")}
          </button>
        </section>
      ) : null}

      {/* Step 3 — the category's dynamic form */}
      {step === "form" ? (
        <section className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={t("common.back")}
              className="flex min-h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300"
              onClick={() => setStep("category")}>
              <ChevronLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900">
                {form ? form.category.name[lang] : t("onboarding.steps.form")}
              </h1>
              <p className="text-sm text-slate-500">{name}</p>
            </div>
          </div>

          {formLoading || !form ? (
            <div className="flex justify-center py-8"><Loader2 className="size-8 animate-spin text-slate-400" /></div>
          ) : (
            <div className="space-y-5">
              {visibleFields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={attributes[field.key]}
                  error={fieldErrors[field.key]}
                  onChange={setAttribute}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 text-lg font-bold text-white hover:bg-indigo-700"
            onClick={() => {
              if (validateAttributes()) setStep("review");
            }}
          >
            {t("common.next")}
          </button>
        </section>
      ) : null}

      {/* Step 4 — review & submit */}
      {step === "review" ? (
        <section className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={t("common.back")}
              className="flex min-h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300"
              onClick={() => setStep("form")}>
              <ChevronLeft className="size-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">{t("onboarding.steps.review")}</h1>
          </div>

          <dl className="space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">{t("onboarding.name")}</dt>
              <dd className="text-right font-bold text-slate-900">{name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-slate-500">{t("onboarding.phone")}</dt>
              <dd className="text-right font-bold text-slate-900">{phone}</dd>
            </div>
            {categoryName ? (
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-slate-500">{t("onboarding.categoryLabel")}</dt>
                <dd className="text-right font-bold text-slate-900">{categoryName}</dd>
              </div>
            ) : null}
          </dl>

          {form ? (
            <dl className="space-y-2 border-t-2 border-slate-100 pt-3">
              {form.fields.map((field) => {
                const value = attributes[field.key];
                const empty =
                  value === null || value === undefined || value === "" ||
                  (Array.isArray(value) && value.length === 0);
                if (empty) return null;
                const shown = Array.isArray(value) ? value.join(", ") : String(value);
                return (
                  <div key={field.key} className="flex justify-between gap-4">
                    <dt className="font-bold text-slate-500">{fieldLabel(field, lang)}</dt>
                    <dd className="text-right text-slate-900">{shown}</dd>
                  </div>
                );
              })}
            </dl>
          ) : null}

          <button
            type="button" disabled={saving}
            className="h-12 w-full rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-400 hover:to-violet-500 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            onClick={submit}
          >
            {saving ? t("onboarding.submitting") : t("onboarding.submit")}
          </button>
        </section>
      ) : null}
    </div>
  );
}
