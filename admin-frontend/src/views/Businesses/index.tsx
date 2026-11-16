"use client";

// src/views/Businesses/index.tsx
// Business submissions queue. Table/filter UI is config from the hook plus
// the common DataTable/FilterBar; this view owns quick-approve from the row
// and the full review dialog.
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/common/components/DataTable";
import { FilterBar } from "@/common/components/FilterBar";
import { businessesService, type AdminBusiness } from "@/services/businesses.service";
import { ApiError } from "@/services/api.service";
import { BusinessReviewDialog } from "@/views/Businesses/components/BusinessReviewDialog";
import { BUSINESS_FILTERS, useBusinessColumns, useBusinesses } from "@/views/Businesses/hooks/useBusinesses";

export function Businesses () {
  const { items, pagination, loading, error, filters, setFilter, setPage, refresh } =
    useBusinesses();

  const [reviewing, setReviewing] = useState<AdminBusiness | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const openReview = useCallback((business: AdminBusiness) => setReviewing(business), []);

  // Quick approve from the row — one click, toast feedback, list refresh
  const quickApprove = useCallback(
    async (business: AdminBusiness) => {
      setApprovingId(business.id);
      try {
        await businessesService.approve(business.id);
        toast.success(`${business.name} approved`, {
          description: "The business profile is now published."
        });
        await refresh();
      } catch (err) {
        toast.error("Could not approve the business", {
          description: err instanceof ApiError ? err.message : "Please try again."
        });
      } finally {
        setApprovingId(null);
      }
    },
    [refresh]
  );

  const columns = useBusinessColumns({ onReview: openReview, onApprove: quickApprove });

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
        loading={loading || approvingId !== null}
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
