// src/services/business.service.ts
// Pachankaun business profile API client: category tree, schema-driven
// category forms, and the owner's business CRUD.
import { apiRequest } from "./api.service";

/** Field types the dynamic form renderer knows how to draw. */
export type FieldType =
  | "text" | "number" | "select" | "multi_select" | "boolean"
  | "time_range" | "address" | "phone" | "url" | "image" | "repeater";

/** One field of a category's resolved form — comes from the DB, never hardcoded. */
export interface FieldDefinition {
  key: string;
  label: { en: string; hi: string };
  help_text: { en: string | null; hi: string | null };
  type: FieldType;
  options: string[] | null;
  validation: {
    required?: boolean;
    min?: number;
    max?: number;
    minItems?: number;
    maxItems?: number;
    maxLength?: number;
    pattern?: string;
  };
  show_on_profile: boolean;
  visible_if: { field: string; equals: unknown } | null;
  inherited: boolean;
}

export interface CategoryNode {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  is_leaf: boolean;
  children?: CategoryNode[];
}

export interface CategoryForm {
  category: { id: string; name: { en: string; hi: string }; slug: string };
  fields: FieldDefinition[];
}

export type LinkType =
  | "website" | "whatsapp" | "instagram" | "facebook" | "youtube"
  | "booking" | "menu" | "map" | "custom";

export interface BusinessLink {
  id: string;
  type: LinkType;
  url: string;
  title: string;
  display_order: number;
}

export type BusinessStatus = "draft" | "pending_review" | "published" | "rejected";

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  website_url: string | null;
  address: Record<string, unknown> | null;
  service_area: Record<string, unknown> | null;
  hours: Record<string, unknown> | null;
  status: BusinessStatus;
  verification_status: "unverified" | "pending" | "verified";
  completeness_score: number;
  form_version: number;
  attributes: Record<string, unknown>;
  rejection_reason: string | null;
  primary_category_id: string;
  links?: BusinessLink[];
  primaryCategory?: { id: string; name_en: string; name_hi: string; slug: string } | null;
}

export type CreateBusinessPayload = {
  name: string;
  primaryCategoryId: string;
  phone: string;
  description?: string;
  address?: Record<string, unknown>;
  attributes: Record<string, unknown>;
  links?: { type: LinkType; url: string; title: string }[];
};

export type UpdateBusinessPayload = Partial<{
  name: string;
  phone: string;
  whatsapp: string | null;
  websiteUrl: string | null;
  description: string | null;
  address: Record<string, unknown>;
  hours: Record<string, unknown>;
  attributes: Record<string, unknown>;
}>;

export const businessService = {
  /** GET /api/v1/categories — active category tree for the picker */
  listCategories: () =>
    apiRequest<{ items: CategoryNode[] }>("/api/v1/categories"),

  /** GET /api/v1/categories/:id/form — resolved schema-driven form */
  getCategoryForm: (categoryId: string) =>
    apiRequest<CategoryForm>(`/api/v1/categories/${categoryId}/form`),

  /** POST /api/v1/businesses — create the owner's business (starts as draft) */
  create: (payload: CreateBusinessPayload) =>
    apiRequest<Business>("/api/v1/businesses", { method: "POST", body: payload }),

  /** GET /api/v1/businesses/me — the owner's profile (null when none yet) */
  getMine: async (): Promise<Business | null> => {
    try {
      return await apiRequest<Business>("/api/v1/businesses/me");
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "NOT_FOUND") return null;
      throw error;
    }
  },

  /** PATCH /api/v1/businesses/me — update base columns / merge attributes */
  update: (payload: UpdateBusinessPayload) =>
    apiRequest<Business>("/api/v1/businesses/me", { method: "PATCH", body: payload }),

  /** POST /api/v1/businesses/me/submit — send draft to admin review */
  submit: () =>
    apiRequest<Business>("/api/v1/businesses/me/submit", { method: "POST" }),

  /** GET /api/v1/businesses/me/links — ordered linktree-style links */
  listLinks: () =>
    apiRequest<{ items: BusinessLink[] }>("/api/v1/businesses/me/links"),
};
