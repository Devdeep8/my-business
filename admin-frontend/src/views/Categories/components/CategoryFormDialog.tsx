"use client";

import { useMemo, useState } from "react";
import { IconLoader } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { CommonForm, type FormControlConfig } from "@/common/components/Form";
import type { Category, CreateCategoryPayload } from "@/services/categories.service";
import { ApiError } from "@/services/api.service";
import { categoriesService } from "@/services/categories.service";
import { slugify } from "@/common/utils/slugify";

const CATEGORY_FORM_VALIDATION = {
  name_en: { required: "English name is required", maxLength: 255 },
  name_hi: { required: "Hindi name is required", maxLength: 255 },
  slug: {
    required: "Slug is required",
    maxLength: 255,
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message: "Use lowercase letters, numbers, and single dashes (e.g. home-services)"
    }
  },
  displayOrder: {
    validate: (value: unknown) =>
      Number(value) >= 0 ? undefined : "Display order must be zero or greater"
  }
};

type CategoryFormDialogProps = {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
};

export function CategoryFormDialog({
  open,
  categories,
  onClose,
  onSaved
}: CategoryFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const controls = useMemo<FormControlConfig[]>(() => [
    {
      name: "name_en",
      type: "input",
      label: "Name (English)",
      placeholder: "e.g. Home Services",
      grid: { md: 6 }
    },
    {
      name: "name_hi",
      type: "input",
      label: "Name (Hindi)",
      placeholder: "e.g. होम सर्विसेज",
      grid: { md: 6 }
    },
    {
      name: "slug",
      type: "input",
      label: "Slug",
      placeholder: "home-services",
      hint: "Generated from the English name; you can customize it.",
      autoFrom: { field: "name_en", transform: slugify },
      grid: { md: 12 }
    },
    {
      name: "parentId",
      type: "select",
      label: "Parent category",
      options: [
        { value: "none", label: "No parent (top-level)" },
        ...categories.map((category) => ({
          value: category.id,
          label: category.name_en
        }))
      ],
      grid: { md: 12 }
    },
    {
      name: "displayOrder",
      type: "input",
      inputType: "number",
      label: "Display order",
      grid: { md: 4 }
    },
    {
      name: "isActive",
      type: "select",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ],
      grid: { md: 4 }
    },
    {
      name: "isLeaf",
      type: "select",
      label: "Business selection",
      options: [
        { value: "true", label: "Selectable" },
        { value: "false", label: "Not selectable" }
      ],
      grid: { md: 4 }
    }
  ], [categories]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormError(null);
    const payload: CreateCategoryPayload = {
      name_en: String(values.name_en ?? "").trim(),
      name_hi: String(values.name_hi ?? "").trim(),
      slug: String(values.slug ?? "").trim(),
      parentId: values.parentId === "none" ? null : String(values.parentId),
      displayOrder: Number(values.displayOrder ?? 0),
      isActive: values.isActive === "true",
      isLeaf: values.isLeaf === "true"
    };

    try {
      await categoriesService.create(payload);
      onSaved();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Failed to create category. Please try again."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setFormError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Add a category to the directory and optionally place it under a parent.
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <CommonForm
          key={open ? "category-form-open" : "category-form-closed"}
          controls={controls}
          initialValues={{
            name_en: "",
            name_hi: "",
            slug: "",
            parentId: "none",
            displayOrder: "0",
            isActive: "true",
            isLeaf: "true"
          }}
          validationSchema={CATEGORY_FORM_VALIDATION}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" type="button" />}
                disabled={isSubmitting}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <IconLoader className="animate-spin" />}
                Create category
              </Button>
            </DialogFooter>
          )}
        </CommonForm>
      </DialogContent>
    </Dialog>
  );
}
