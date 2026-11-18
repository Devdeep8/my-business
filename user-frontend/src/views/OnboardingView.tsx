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
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, Loader2, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
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

const stepVariants = {
  enter: { opacity: 0, x: 12 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 }
};

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
  const [address, setAddress] = useState({ line1: "", city: "", state: "", pincode: "" });

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
        if (existing.address) {
          setAddress({
            line1: String(existing.address.line1 || ""),
            city: String(existing.address.city || ""),
            state: String(existing.address.state || ""),
            pincode: String(existing.address.pincode || "")
          });
        }
        setCategoryId(existing.primaryCategoryId);
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
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim() || !/^\d{6}$/.test(address.pincode.trim())) {
      errs.push("Please enter a complete address with a 6-digit pincode.");
    }
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
      if (field.type === "repeater" && Array.isArray(value)) {
        const subfields = field.validation?.repeater_fields || [];
        const missingSubfield = subfields.some((subfield) => subfield.required && value.some((row) => {
          if (!row || typeof row !== "object") return true;
          const subValue = (row as Record<string, unknown>)[subfield.key];
          return subValue === null || subValue === undefined || subValue === "";
        }));
        if (missingSubfield) errs[field.key] = t("onboarding.errors.required");
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
          address,
          attributes
        });
      } else if (business) {
        business = await businessService.update({
          name: name.trim(),
          phone: phone.trim(),
          description: description.trim(),
          address,
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
  const goBack = () => {
    if (step === "category") setStep("basics");
    else if (step === "form") setStep("category");
    else if (step === "review") setStep("form");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2" aria-label={t("onboarding.progress")}>
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <span className="flex items-center gap-2">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    done
                      ? "bg-angaar-600 text-white"
                      : current
                        ? "bg-angaar-600 text-white ring-4 ring-angaar-600/15"
                        : "bg-ink-200 text-ink-500"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    current ? "text-ink-950" : "text-ink-400"
                  }`}
                >
                  {t(s.titleKey)}
                </span>
              </span>
              {i < STEPS.length - 1 ? (
                <span className={`h-px flex-1 ${done ? "bg-angaar-600/40" : "bg-ink-200"}`} />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="pk-card">
        {errors.length > 0 ? (
          <div className="m-4 rounded-lg bg-destructive/10 p-3 space-y-1" role="alert">
            {errors.map((error) => (
              <p key={error} className="text-sm font-medium text-destructive">{error}</p>
            ))}
          </div>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {/* Step 1 — basics */}
          {step === "basics" ? (
            <motion.section
              key="basics"
              variants={stepVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5 p-6"
            >
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {t("onboarding.steps.basics")}
                </h1>
                <p className="mt-0.5 text-sm text-ink-500">{name || " "}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="biz-name" className="block text-sm font-medium">
                    {t("onboarding.name")}<span className="ml-0.5 text-angaar-600">*</span>
                  </label>
                  <Input id="biz-name" value={name} autoComplete="organization"
                    onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="biz-phone" className="block text-sm font-medium">
                    {t("onboarding.phone")}<span className="ml-0.5 text-angaar-600">*</span>
                  </label>
                  <Input id="biz-phone" inputMode="tel" value={phone} autoComplete="tel"
                    onChange={(e) => setPhone(e.target.value)} />
                  <p className="text-xs text-ink-400">+91 XXXXXXXXXX</p>
                </div>
                <div className="space-y-2 rounded-(--radius-card) border border-ink-200 p-3">
                  <p className="text-sm font-medium">Business location</p>
                  <div className="space-y-2">
                    <Input placeholder="Street / shop / building" value={address.line1} onChange={(event) => setAddress((prev) => ({ ...prev, line1: event.target.value }))} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input placeholder="City" value={address.city} onChange={(event) => setAddress((prev) => ({ ...prev, city: event.target.value }))} />
                      <Input placeholder="State" value={address.state} onChange={(event) => setAddress((prev) => ({ ...prev, state: event.target.value }))} />
                    </div>
                    <Input inputMode="numeric" placeholder="Pincode" value={address.pincode} maxLength={6} onChange={(event) => setAddress((prev) => ({ ...prev, pincode: event.target.value.replace(/[^0-9]/g, "") }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="biz-desc" className="block text-sm font-medium">
                    {t("onboarding.description")}
                    <span className="ml-1.5 text-xs font-normal text-ink-400">(optional)</span>
                  </label>
                  <textarea id="biz-desc" rows={3} value={description}
                    className="pk-input h-auto py-2.5"
                    onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end border-t border-ink-100 pt-4">
                <Button className="pk-btn pk-btn-primary h-10" onClick={() => { if (validateBasics()) setStep("category"); }}>
                  {t("common.next")}
                </Button>
              </div>
            </motion.section>
          ) : null}

          {/* Step 2 — category picker */}
          {step === "category" ? (
            <motion.section
              key="category"
              variants={stepVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4 p-6"
            >
              <div className="flex items-center gap-2">
                <Button className="size-9 shrink-0 cursor-pointer rounded-full hover:bg-ink-100 hover:text-ink-950" aria-label={t("common.back")} onClick={goBack}>
                  <ChevronLeft className="size-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    {t("onboarding.steps.category")}
                  </h1>
                  <p className="text-sm text-ink-500">{name}</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input value={search} className="pl-9"
                  placeholder={t("onboarding.searchCategory")}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="-mx-2 max-h-[22rem] overflow-y-auto px-2">
                {treeLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="size-6 animate-spin text-ink-400" />
                  </div>
                ) : (
                  <ul className="divide-y divide-border/70">
                    {tree
                      .filter((node) =>
                        !search.trim() ||
                        `${node.name_en} ${node.name_hi}`.toLowerCase().includes(search.trim().toLowerCase())
                      )
                      .map((node) => {
                        const isGroup = node.children && node.children.length > 0;
                        const open = isGroup ? expanded === node.id || !!search.trim() : true;
                        return (
                          <li key={node.id}>
                            {isGroup ? (
                              <button
                                type="button"
                                aria-expanded={expanded === node.id}
                                className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium"
                                onClick={() => setExpanded(expanded === node.id ? null : node.id)}
                              >
                                {node[`name_${lang}`] || node.name_en}
                                <ChevronDown className={`size-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
                              </button>
                            ) : null}
                            {open ? (
                              <ul className={isGroup ? "pb-2" : undefined}>
                                {(isGroup ? node.children ?? [] : [node]).map((leaf) => {
                                  const selected = categoryId === leaf.id;
                                  return (
                                    <li key={leaf.id}>
                                      <button
                                        type="button"
                                        aria-pressed={selected}
                                        className={`mt-1 flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                                          selected
                                            ? "border-angaar-600 bg-angaar-50 text-angaar-700"
                                            : "border-transparent text-ink-700 hover:bg-ink-50"
                                        }`}
                                        onClick={() => setCategoryId(leaf.id)}
                                      >
                                        {leaf[`name_${lang}`] || leaf.name_en}
                                        {selected ? <Check className="size-4 text-angaar-600" /> : null}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <Button className="pk-btn pk-btn-secondary h-10" onClick={goBack}>
                  {t("common.back")}
                </Button>
                <Button className="pk-btn pk-btn-primary h-10" disabled={!categoryId}
                  onClick={() => { setForm(null); setStep("form"); }}>
                  {t("common.next")}
                </Button>
              </div>
            </motion.section>
          ) : null}

          {/* Step 3 — the category's dynamic form */}
          {step === "form" ? (
            <motion.section
              key="form"
              variants={stepVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5 p-6"
            >
              <div className="flex items-center gap-2">
                <Button className="size-9 shrink-0 cursor-pointer rounded-full hover:bg-ink-100 hover:text-ink-950" aria-label={t("common.back")} onClick={goBack}>
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold tracking-tight">
                    {form ? form.category.name[lang] : t("onboarding.steps.form")}
                  </h1>
                  <p className="truncate text-sm text-ink-500">{name}</p>
                </div>
              </div>

              {formLoading || !form ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-ink-400" />
                </div>
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

              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <Button className="pk-btn pk-btn-secondary h-10" onClick={goBack}>
                  {t("common.back")}
                </Button>
                <Button className="pk-btn pk-btn-primary h-10"
                  onClick={() => { if (validateAttributes()) setStep("review"); }}>
                  {t("common.next")}
                </Button>
              </div>
            </motion.section>
          ) : null}

          {/* Step 4 — review & submit */}
          {step === "review" ? (
            <motion.section
              key="review"
              variants={stepVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5 p-6"
            >
              <div className="flex items-center gap-2">
                <Button className="size-9 shrink-0 cursor-pointer rounded-full hover:bg-ink-100 hover:text-ink-950" aria-label={t("common.back")} onClick={goBack}>
                  <ChevronLeft className="size-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    {t("onboarding.steps.review")}
                  </h1>
                  <p className="text-sm text-ink-500">{name}</p>
                </div>
              </div>

              <dl className="space-y-2.5 rounded-xl bg-ink-50 p-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-ink-500">{t("onboarding.name")}</dt>
                  <dd className="text-right text-sm font-medium">{name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-ink-500">{t("onboarding.phone")}</dt>
                  <dd className="text-right text-sm font-medium">{phone}</dd>
                </div>
                {categoryName ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm text-ink-500">{t("onboarding.categoryLabel")}</dt>
                    <dd className="text-right text-sm font-medium">{categoryName}</dd>
                  </div>
                ) : null}
                {description ? (
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-sm text-ink-500">{t("onboarding.description")}</dt>
                    <dd className="text-right text-sm text-foreground/80">{description}</dd>
                  </div>
                ) : null}
              </dl>

              {form && form.fields.some((field) => {
                const value = attributes[field.key];
                return !(value === null || value === undefined || value === "" ||
                  (Array.isArray(value) && value.length === 0));
              }) ? (
                <dl className="space-y-2.5">
                  {form.fields.map((field) => {
                    const value = attributes[field.key];
                    const empty =
                      value === null || value === undefined || value === "" ||
                      (Array.isArray(value) && value.length === 0);
                    if (empty) return null;
                    const shown = Array.isArray(value) ? value.join(", ") : String(value);
                    return (
                      <div key={field.key} className="flex justify-between gap-4">
                        <dt className="text-sm text-ink-500">{fieldLabel(field, lang)}</dt>
                        <dd className="text-right text-sm text-foreground/80">{shown}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : null}

              <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                <Button className="pk-btn pk-btn-secondary h-10" onClick={goBack}>
                  {t("common.back")}
                </Button>
                <Button className="pk-btn pk-btn-primary h-10" disabled={saving} onClick={submit}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? t("onboarding.submitting") : t("onboarding.submit")}
                </Button>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
