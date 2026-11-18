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
      <label htmlFor={field.key} className="block text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-angaar-600">*</span> : null}
        {!required && field.type !== "boolean" ? (
          <span className="ml-1.5 text-xs font-normal text-ink-400">(optional)</span>
        ) : null}
      </label>

      {help ? (
        <p id={describedBy} className="text-xs text-ink-500">
          {help}
        </p>
      ) : null}

      <FieldInput field={field} value={value} invalid={invalid} disabled={disabled} lang={lang} onChange={onChange} />

      {error ? (
        <p id={errorId} className="text-xs font-medium text-signal-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared chip classes for the option-style inputs (select / multi_select) */
const chipClasses = (selected: boolean) => `pk-chip ${selected ? "pk-chip-on" : "pk-chip-off"}`;

function FieldInput({
  field, value, invalid, disabled, lang, onChange
}: {
  field: FieldDefinition;
  value: unknown;
  invalid: boolean;
  disabled?: boolean;
  lang: Language;
  onChange: (key: string, value: unknown) => void;
}) {
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
                className={chipClasses(selected)}
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
                className={chipClasses(selected)}
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
        <div className="inline-flex rounded-(--radius-field) border border-ink-200 bg-white p-0.5">
          {[true, false].map((yes) => {
            const selected = value === yes;
            return (
              <button
                key={String(yes)}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={`h-8 min-w-16 rounded-md px-3.5 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-angaar-600 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                }`}
                onClick={() => onChange(field.key, yes)}
              >
                {yes ? (langIsHindi() ? "हाँ" : "Yes") : langIsHindi() ? "नहीं" : "No"}
              </button>
            );
          })}
        </div>
      );

    case "repeater": {
      const rows = Array.isArray(value) ? value as Record<string, unknown>[] : [];
      const subfields = field.validation?.repeater_fields ?? [];

      const updateRow = (index: number, subKey: string, subValue: unknown) => {
        const next = rows.map((row, rowIndex) => rowIndex === index ? { ...row, [subKey]: subValue } : row);
        onChange(field.key, next);
      };

      return (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="rounded-(--radius-card) border border-ink-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-500">Item {index + 1}</span>
                <button type="button" className="text-xs font-medium text-signal-danger" onClick={() => onChange(field.key, rows.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>
              </div>
              {subfields.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {subfields.map((subfield) => {
                    const subLabel = subfield.label[lang] || subfield.label.en;
                    const subValue = row[subfield.key];
                    return (
                      <label key={subfield.key} className="space-y-1 text-xs font-medium">
                        <span>{subLabel}{subfield.required ? <span className="ml-0.5 text-angaar-600">*</span> : null}</span>
                        {subfield.type === "number" ? (
                          <Input type="number" value={subValue === null || subValue === undefined ? "" : String(subValue)} onChange={(event) => updateRow(index, subfield.key, event.target.value === "" ? null : Number(event.target.value))} />
                        ) : subfield.type === "boolean" ? (
                          <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={String(Boolean(subValue))} onChange={(event) => updateRow(index, subfield.key, event.target.value === "true")}>
                            <option value="true">Yes</option><option value="false">No</option>
                          </select>
                        ) : subfield.type === "select" ? (
                          <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={typeof subValue === "string" ? subValue : ""} onChange={(event) => updateRow(index, subfield.key, event.target.value || null)}>
                            <option value="">Select</option>{(subfield.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          <Input type={subfield.type === "url" ? "url" : "text"} value={typeof subValue === "string" ? subValue : ""} onChange={(event) => updateRow(index, subfield.key, event.target.value)} />
                        )}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-ink-500">Configure repeater columns in Admin → Categories.</p>
              )}
            </div>
          ))}
          <button type="button" className="pk-chip pk-chip-off" onClick={() => onChange(field.key, [...rows, {}])}>+ Add item</button>
        </div>
      );
    }

    // time_range / address / image are structured inputs; MVP stores JSON
    // as a plain text representation until dedicated controls are added.
    default:
      return (
        <Input
          id={field.key}
          value={typeof value === "string" ? value : value ? JSON.stringify(value) : ""}
          disabled={disabled}
          aria-invalid={invalid}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

// Yes/No labels follow the UI language (plain helper, not a hook)
function langIsHindi() {
  return typeof window !== "undefined" && localStorage.getItem("app-language") === "hi";
}
