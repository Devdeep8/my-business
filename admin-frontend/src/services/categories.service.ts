import { apiRequest } from "./api.service";

export interface Category {
  id: string;
  name_en: string;
  name_hi: string;
  slug: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  isLeaf: boolean;
}

export type CreateCategoryPayload = Omit<Category, "id">;

export interface CategoryField {
  id: string;
  categoryId: string;
  key: string;
  labelEn: string;
  labelHi: string;
  type: "text" | "number" | "select" | "multi_select" | "boolean" | "time_range" | "address" | "phone" | "url" | "image" | "repeater";
  options: string[] | null;
  validation: Record<string, unknown>;
  helpTextEn: string | null;
  helpTextHi: string | null;
  displayOrder: number;
  showOnProfile: boolean;
  visibleIf: Record<string, unknown> | null;
  isActive: boolean;
}

export type CategoryFieldPayload = Omit<CategoryField, "id" | "categoryId">;

type CategoryListResponse = {
  items: Category[];
};

export const categoriesService = {
  list: () => apiRequest<CategoryListResponse>("/api/v1/categories"),

  create: (payload: CreateCategoryPayload) =>
    apiRequest<Category>("/api/v1/categories", { method: "POST", body: payload }),

  listFields: (categoryId: string) =>
    apiRequest<{ items: CategoryField[] }>(`/api/v1/categories/${categoryId}/fields`),

  createField: (categoryId: string, payload: CategoryFieldPayload) =>
    apiRequest<CategoryField>(`/api/v1/categories/${categoryId}/fields`, { method: "POST", body: payload }),

  updateField: (fieldId: string, payload: Partial<CategoryFieldPayload>) =>
    apiRequest<CategoryField>(`/api/v1/categories/fields/${fieldId}`, { method: "PATCH", body: payload }),

  deleteField: (fieldId: string) =>
    apiRequest<{ id: string }>(`/api/v1/categories/fields/${fieldId}`, { method: "DELETE" })
};
