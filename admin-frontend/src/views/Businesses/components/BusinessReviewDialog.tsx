"use client";

// src/views/Businesses/components/BusinessReviewDialog.tsx
// Review dialog: full submission detail (category, attributes, links,
// completeness) with the approve / reject-with-reason actions.
import { useEffect, useState } from "react";
import { IconCircleCheck, IconLoader } from "@tabler/icons-react";
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
import { Textarea } from "@/components/ui/textarea";
import { businessesService, type AdminBusiness } from "@/services/businesses.service";
import { ApiError } from "@/services/api.service";

type Props = {
  business: AdminBusiness | null;
  onClose: () => void;
  onActioned: () => void;
};

function formatValue (value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function BusinessReviewDialog ({ business, onClose, onActioned }: Props) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset local state whenever a different business is opened
  useEffect(() => {
    setReason("");
    setError(null);
    setBusy(null);
  }, [business?.id]);

  const approve = async () => {
    if (!business) return;
    setBusy("approve");
    setError(null);
    try {
      await businessesService.approve(business.id);
      onActioned();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve the business");
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    if (!business) return;
    setBusy("reject");
    setError(null);
    try {
      await businessesService.reject(business.id, reason.trim());
      onActioned();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject the business");
    } finally {
      setBusy(null);
    }
  };

  const attributeEntries = business
    ? Object.entries(business.attributes ?? {}).filter(([, value]) => formatValue(value) !== "—")
    : [];

  return (
    <Dialog open={!!business} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{business?.name}</DialogTitle>
          <DialogDescription>
            {business?.primaryCategory?.name_en ?? "Uncategorised"}
            {business?.owner ? ` · ${business.owner.name} (${business.owner.email})` : ""}
          </DialogDescription>
        </DialogHeader>

        {business && (
          <div className="space-y-4 text-sm">
            {business.status === "rejected" && business.rejectionReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                Rejected: {business.rejectionReason}
              </div>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{formatValue(business.phone)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd>{formatValue(business.whatsapp)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="truncate">{formatValue(business.websiteUrl)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Completeness</dt>
                <dd>{business.completenessScore}%</dd>
              </div>
              {business.description && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd>{business.description}</dd>
                </div>
              )}
              {business.address && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>{formatValue(business.address)}</dd>
                </div>
              )}
            </dl>

            {attributeEntries.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Category details</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {attributeEntries.map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                      <dd>{formatValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {(business.links?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-2 font-medium">Links</h3>
                <ul className="list-inside list-disc space-y-1">
                  {business.links!.map((link) => (
                    <li key={link.id}>
                      {link.title}: <span className="text-muted-foreground">{link.url}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {business?.status !== "published" && (
          <>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Rejection reason (shown to the business owner, required to reject)…"
              rows={2}
            />
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />} disabled={busy !== null}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={reject}
                disabled={busy !== null || reason.trim().length < 5}
              >
                {busy === "reject" && <IconLoader className="animate-spin" />}
                Reject
              </Button>
              <Button onClick={approve} disabled={busy !== null}>
                {busy === "approve" ? <IconLoader className="animate-spin" /> : <IconCircleCheck />}
                Approve &amp; publish
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
