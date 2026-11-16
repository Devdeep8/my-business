// src/lib/publicUrl.ts
// URL builders for the public profile CTAs. Owner-supplied data is only ever
// turned into an href through these helpers — `javascript:`/`data:` schemes
// are dropped so stored links can never become script vectors.

/** tel: href — phones are server-validated `+91XXXXXXXXXX`. */
export const telHref = (phone: string): string => `tel:${phone}`;

/** WhatsApp deep link with a localized prefilled message. */
export const waHref = (phone: string, message: string): string =>
  `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`;

export type AddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
};

/** Google Maps directions URL, or null when there is nothing to target. */
export const mapHref = (name: string, address: AddressLike | null): string | null => {
  const parts = [name, address?.line1, address?.line2, address?.city, address?.pincode]
    .filter((part): part is string => Boolean(part && part.trim()));
  if (parts.length <= 1) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts.join(", "))}`;
};

/** Only http(s) URLs survive — everything else renders as inert text. */
export const safeHttpUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

/** `+919876543210` → `+91 98765 43210` (display only, never re-parsed). */
export const formatPhone = (phone: string): string =>
  phone.length === 13 ? `${phone.slice(0, 3)} ${phone.slice(3, 8)} ${phone.slice(8)}` : phone;
