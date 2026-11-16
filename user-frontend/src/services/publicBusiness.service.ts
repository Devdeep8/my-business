import { apiRequest } from "./api.service";

type PublicAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
};

export type PublicCategory = {
  slug: string;
  name: { en: string; hi: string };
  is_leaf: boolean;
  children?: PublicCategory[];
};

export type PublicBusinessLink = {
  type: string;
  url: string;
  title: string;
};

export type PublicBusinessMedia = {
  url: string;
  alt_text: string | null;
  kind: "logo" | "cover" | "photo" | "video";
};

export type PublicBusinessCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  website_url: string | null;
  city: string | null;
  address: PublicAddress | null;
  hours: Record<string, unknown> | null;
  verification_status: "unverified" | "pending" | "verified";
  category: { id: string; slug: string; name: { en: string; hi: string } } | null;
  links: PublicBusinessLink[];
  cover: { url: string; alt_text: string | null } | null;
  logo: { url: string } | null;
};

export type PublicBusinessProfile = PublicBusinessCard & {
  service_area: unknown;
  opening_date: string | null;
  profile_fields: Array<{
    key: string;
    label: { en: string; hi: string };
    type: string;
    value: unknown;
  }>;
  media: PublicBusinessMedia[];
};

export type PublicBusinessPage = {
  items: PublicBusinessCard[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const publicBusinessService = {
  listCategories: () =>
    apiRequest<{ items: PublicCategory[] }>("/api/v1/public/categories"),

  list: (params: { page?: number; limit?: number; search?: string; category?: string }) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 12));
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.category) query.set("category", params.category);
    return apiRequest<PublicBusinessPage>(`/api/v1/public/businesses?${query.toString()}`);
  },

  get: (slug: string) =>
    apiRequest<PublicBusinessProfile>(`/api/v1/public/businesses/${encodeURIComponent(slug)}`),
};
