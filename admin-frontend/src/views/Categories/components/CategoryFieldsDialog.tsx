"use client";

import { useEffect, useState } from "react";
import { IconLoader, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/services/api.service";
import { categoriesService, type Category, type CategoryField } from "@/services/categories.service";

const fieldTypes = ["text", "number", "select", "multi_select", "boolean", "address", "phone", "url", "image", "time_range", "repeater"] as const;

export function CategoryFieldsDialog({ category, open, onClose }: { category: Category | null; open: boolean; onClose: () => void }) {
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelHi, setLabelHi] = useState("");
  const [type, setType] = useState<(typeof fieldTypes)[number]>("text");
  const [required, setRequired] = useState(false);
  const [showOnProfile, setShowOnProfile] = useState(true);
  const [options, setOptions] = useState("");
  const [repeaterFieldsJson, setRepeaterFieldsJson] = useState("");

  const refresh = async () => {
    if (!category) return;
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesService.listFields(category.id);
      setFields(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load fields");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && category) void refresh();
  }, [open, category?.id]);

  const createField = async () => {
    if (!category || !key.trim() || !labelEn.trim() || !labelHi.trim()) {
      setError("Key, English label, and Hindi label are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let repeaterFields: unknown[] | undefined;
      if (type === "repeater" && repeaterFieldsJson.trim()) {
        try { repeaterFields = JSON.parse(repeaterFieldsJson) as unknown[]; }
        catch { setError("Repeater columns must be valid JSON."); setSaving(false); return; }
      }
      await categoriesService.createField(category.id, {
        key: key.trim(),
        labelEn: labelEn.trim(),
        labelHi: labelHi.trim(),
        type,
        options: ["select", "multi_select"].includes(type)
          ? options.split("|").map((option) => option.trim()).filter(Boolean)
          : null,
        validation: { required, ...(repeaterFields ? { repeater_fields: repeaterFields } : {}) },
        helpTextEn: null,
        helpTextHi: null,
        displayOrder: fields.length,
        showOnProfile,
        visibleIf: null,
        isActive: true
      });
      setKey(""); setLabelEn(""); setLabelHi(""); setOptions(""); setRepeaterFieldsJson(""); setRequired(false); setShowOnProfile(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create field");
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (field: CategoryField) => {
    try {
      await categoriesService.updateField(field.id, { isActive: !field.isActive });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update field");
    }
  };

  const deleteField = async (field: CategoryField) => {
    try {
      await categoriesService.deleteField(field.id);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete field");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure {category?.name_en} form</DialogTitle>
          <DialogDescription>Add or manage category-specific questions. Universal fields apply automatically.</DialogDescription>
        </DialogHeader>

        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <div className="rounded-lg border p-3 space-y-3">
          <p className="font-medium">Add field</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Field key (e.g. product_catalog)" value={key} onChange={(event) => setKey(event.target.value)} />
            <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={type} onChange={(event) => setType(event.target.value as (typeof fieldTypes)[number])}>
              {fieldTypes.map((fieldType) => <option key={fieldType} value={fieldType}>{fieldType}</option>)}
            </select>
            <Input placeholder="English label" value={labelEn} onChange={(event) => setLabelEn(event.target.value)} />
            <Input placeholder="Hindi label" value={labelHi} onChange={(event) => setLabelHi(event.target.value)} />
          </div>
          {["select", "multi_select"].includes(type) && (
            <Input placeholder="Options separated by | (e.g. cash|upi|card)" value={options} onChange={(event) => setOptions(event.target.value)} />
          )}
          {type === "repeater" && (
            <div className="space-y-1">
              <textarea className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono" placeholder={'Repeater columns JSON, for example:\n[{"key":"name","label":{"en":"Name","hi":"नाम"},"type":"text","required":true}]'} value={repeaterFieldsJson} onChange={(event) => setRepeaterFieldsJson(event.target.value)} />
              <p className="text-xs text-muted-foreground">Define product/menu/doctor-service columns. Types: text, number, select, boolean, url.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> Required</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showOnProfile} onChange={(event) => setShowOnProfile(event.target.checked)} /> Show on public profile</label>
          </div>
          <Button type="button" onClick={() => void createField()} disabled={saving}><IconPlus />{saving ? "Adding…" : "Add field"}</Button>
        </div>

        <div className="space-y-2">
          {loading ? <div className="flex justify-center py-6"><IconLoader className="animate-spin" /></div> : fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{field.labelEn} <span className="text-muted-foreground">({field.type})</span></p>
                <p className="text-xs font-mono text-muted-foreground">{field.key}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => void toggleField(field)}>{field.isActive ? "Disable" : "Enable"}</Button>
                <Button size="sm" variant="outline" onClick={() => void deleteField(field)}><IconTrash /></Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
