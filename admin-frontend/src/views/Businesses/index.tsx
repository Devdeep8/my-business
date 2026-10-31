"use client";

// src/views/Businesses/index.tsx
// Business submissions queue. Table/filter UI is config from the hook plus
// the common DataTable/FilterBar; this view only owns the review dialog.
import { useCallback, useState } from "react";
import { DataTable } from "@/common/components/DataTable";
import { FilterBar } from "@/common/components/FilterBar";
import type { AdminBusiness } from "@/services/businesses.service";
import { BusinessReviewDialog } from "@/views/Businesses/components/BusinessReviewDialog";
import { BUSINESS_FILTERS, useBusinessColumns, useBusinesses } from "@/views/Businesses/hooks/useBusinesses";

export function Businesses () {
  const { items, pagination, loading, error, filters, setFilter, setPage, refresh } =
    useBusinesses();

  const [reviewing, setReviewing] = useState<AdminBusiness | null>(null);
  const openReview = useCallback((business: AdminBusiness) => setReviewing(business), []);

  const columns = useBusinessColumns({ onReview: openReview });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Businesses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review new business submissions, then approve to publish their public profile or reject
          with a reason.
        </p>
      </div>

      <FilterBar config={BUSINESS_FILTERS} values={filters} onChange={setFilter} />

      <DataTable
        columns={columns}
        data={items}
        rowKey={(business) => business.id}
        loading={loading}
        error={error}
        onRetry={refresh}
        emptyMessage="No businesses match these filters."
        pagination={pagination}
        onPageChange={setPage}
        skeletonRows={10}
      />

      <BusinessReviewDialog
        business={reviewing}
        onClose={() => setReviewing(null)}
        onActioned={refresh}
      />
    </div>
  );
}
