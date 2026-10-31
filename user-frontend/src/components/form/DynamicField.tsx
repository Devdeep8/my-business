"use client";

// src/components/form/DynamicField.tsx
// Renders ONE schema-driven field definition as the right input for its
// type — the form engine's view half. No category-specific rendering lives
// here; everything (label, help, options, required) comes from the DB schema.
import { useLanguage, type Language } from "@/lib/i18n";
import type { FieldDefinition } from "@/services/business.service";
import { Input } from "@/components/ui/input";

/** A field's localized label/help from the schema's { en, hi } pair. */
export const fieldLabel = (field: FieldDefinition, lang: Language) =>
  field.label[lang] || field.label.en;

const fieldHelp = (field: FieldDefinition, lang: Language) => {
  const help = field.help_text?.[lang] || field.help_text?.en;
  return help || undefined;
};

type DynamicFieldProps = {
  field: FieldDefinition;
  value: unknown;
  error?: string | null;
  disabled?: boolean;
  onChange: (key: string, value: unknown) => void;
};

export function DynamicField({ field, value, error, disabled, onChange }: DynamicFieldProps) {
  const { lang } = useLanguage();
  const label = fieldLabel(field, lang);
  const help = fieldHelp(field, lang);
  const required = Boolean(field.validation?.required);
  const invalid = Boolean(error);

  const describedBy = help ? `${field.key}-help` : undefined;
  const errorId = error ? `${field.key}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.key} className="block text-base font-bold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-indigo-600">*</span> : null}
        {!required && field.type !== "boolean" ? (
          <span className="ml-2 text-sm font-normal text-slate-400">(optional)</span>
        ) : null}
      </label>

      {help ? (
        <p id={describedBy} className="text-sm text-slate-500">
          {help}
        </p>
      ) : null}

      <FieldInput field={field} value={value} invalid={invalid} disabled={disabled} onChange={onChange} />

      {error ? (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FieldInput({
  field, value, invalid, disabled, onChange
}: {
  field: FieldDefinition;
  value: unknown;
  invalid: boolean;
  disabled?: boolean;
  onChange: (key: string, value: unknown) => void;
}) {
  const shared = invalid
    ? "border-red-400 focus-visible:ring-red-300"
    : "border-slate-300 focus-visible:ring-indigo-300";

  switch (field.type) {
    case "text":
    case "url":
    case "phone":
      return (
        <Input
          id={field.key}
          type={field.type === "url" ? "url" : "text"}
          inputMode={field.type === "phone" ? "tel" : undefined}
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          aria-invalid={invalid}
          className={shared}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "number":
      return (
        <Input
          id={field.key}
          type="number"
          inputMode="numeric"
          value={value === null || value === undefined ? "" : String(value)}
          disabled={disabled}
          aria-invalid={invalid}
          className={shared}
          onChange={(e) => onChange(field.key, e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "select":
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => onChange(field.key, selected ? null : option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      );

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((option) => {
            const list = Array.isArray(value) ? (value as unknown[]) : [];
            const selected = list.includes(option);
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() =>
                  onChange(
                    field.key,
                    selected ? list.filter((v) => v !== option) : [...list, option]
                  )
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      );

    case "boolean":
      return (
        <div className="flex gap-2">
          {[true, false].map((yes) => {
            const selected = value === yes;
            return (
              <button
                key={String(yes)}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold ${
                  selected
                    ? yes
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-500 bg-slate-100 text-slate-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => onChange(field.key, yes)}
              >
                {yes ? (uiIsHindi() ? "हाँ" : "Yes") : uiIsHindi() ? "नहीं" : "No"}
              </button>
            );
          })}
        </div>
      );

    // time_range / address / image / repeater are structured inputs; MVP
    // stores JSON — render a plain text input for now and specialize later.
    default:
      return (
        <Input
          id={field.key}
          value={typeof value === "string" ? value : value ? JSON.stringify(value) : ""}
          disabled={disabled}
          aria-invalid={invalid}
          className={shared}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

// Yes/No labels follow the UI language (plain helper, not a hook)
function uiIsHindi() {
  return typeof window !== "undefined" && localStorage.getItem("app-language") === "hi";
}
