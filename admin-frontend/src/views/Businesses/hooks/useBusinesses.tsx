"use client";

// src/views/Businesses/hooks/useBusinesses.tsx
// Business submissions queue = filter config + column config + a thin wrapper
// around useDataTable (same pattern as views/AppUsers).
import { useCallback } from "react";
import { IconEye } from "@tabler/icons-react";
import { businessesService, type AdminBusiness } from "@/services/businesses.service";
import { useDataTable } from "@/common/hooks/useDataTable";
import type { DataColumn, FilterConfig } from "@/common/dataTable";

export const BUSINESS_FILTERS: FilterConfig[] = [
  {
    type: "select",
    key: "status",
    ariaLabel: "Filter by status",
    options: [
      { value: "", label: "All statuses" },
      { value: "pending_review", label: "Pending review" },
      { value: "published", label: "Published" },
      { value: "rejected", label: "Rejected" },
      { value: "draft", label: "Draft" }
    ]
  },
  {
    type: "search",
    key: "q",
    placeholder: "Search by name…",
    ariaLabel: "Search businesses"
  }
];

type BusinessColumnHandlers = {
  onReview: (business: AdminBusiness) => void;
};

export function useBusinessColumns({ onReview }: BusinessColumnHandlers): DataColumn<AdminBusiness>[] {
  return [
    {
      key: "name",
      header: "Business",
      type: "text",
      accessor: (business) => business.name,
      subAccessor: (business) =>
        business.primaryCategory ? business.primaryCategory.name_en : "Uncategorised"
    },
    {
      key: "owner",
      header: "Owner",
      type: "text",
      accessor: (business) => business.owner?.name ?? "—",
      subAccessor: (business) => business.owner?.email ?? undefined
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      width: "w-32",
      accessor: (business) => business.status.replace("_", " "),
      capitalize: true,
      variants: {
        "pending review": "secondary",
        published: "default",
        rejected: "destructive",
        draft: "outline"
      }
    },
    {
      key: "completenessScore",
      header: "Complete",
      type: "text",
      width: "w-24",
      accessor: (business) => `${business.completenessScore}%`
    },
    {
      key: "createdAt",
      header: "Submitted",
      type: "date",
      width: "w-28",
      accessor: (business) => business.createdAt
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-20",
      type: "actions",
      actions: [
        {
          key: "review",
          icon: IconEye,
          label: (business) => `Review ${business.name}`,
          onClick: onReview
        }
      ]
    }
  ];
}

export function useBusinesses() {
  const fetcher = useCallback(
    async ({
      page,
      limit,
      filters
    }: {
      page: number;
      limit: number;
      filters: Record<string, string>;
    }) => {
      return businessesService.list({
        page,
        limit,
        status: filters.status || undefined,
        q: filters.q?.trim() || undefined
      });
    },
    []
  );

  return useDataTable<AdminBusiness>({
    fetcher,
    initialFilters: { status: "pending_review", q: "" },
    pageSize: 10
  });
}
