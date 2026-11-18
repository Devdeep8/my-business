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

type CategoryListResponse = {
  items: Category[];
};

export const categoriesService = {
  list: () => apiRequest<CategoryListResponse>("/api/v1/categories"),

  create: (payload: CreateCategoryPayload) =>
    apiRequest<Category>("/api/v1/categories", { method: "POST", body: payload })
};
