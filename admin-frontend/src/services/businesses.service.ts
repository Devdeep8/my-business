// src/services/businesses.service.ts
import { apiRequest } from "./api.service";

/** A business profile row in the admin submissions queue */
export interface AdminBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  websiteUrl: string | null;
  address: Record<string, unknown> | null;
  hours: Record<string, unknown> | null;
  status: "draft" | "pending_review" | "published" | "rejected";
  verificationStatus: "unverified" | "pending" | "verified";
  completenessScore: number;
  formVersion: number;
  attributes: Record<string, unknown>;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  primaryCategory?: { id: string; name_en: string; name_hi: string; slug: string } | null;
  owner?: { id: string; name: string; email: string } | null;
  links?: { id: string; type: string; url: string; title: string }[];
}

export interface BusinessListParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export interface BusinessListResponse {
  items: AdminBusiness[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const businessesService = {
  /** GET /api/v1/businesses — queue + index */
  list: (params: BusinessListParams) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    if (params.q) query.set("q", params.q);
    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    return apiRequest<BusinessListResponse>(`/api/v1/businesses${suffix}`, { method: "GET" });
  },

  /** POST /api/v1/businesses/:id/approve — publish the profile */
  approve: (id: string) =>
    apiRequest<AdminBusiness>(`/api/v1/businesses/${id}/approve`, { method: "POST" }),

  /** POST /api/v1/businesses/:id/reject — reject with a reason for the owner */
  reject: (id: string, reason: string) =>
    apiRequest<AdminBusiness>(`/api/v1/businesses/${id}/reject`, {
      method: "POST",
      body: { reason }
    })
};
