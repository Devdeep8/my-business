"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { businessService, type BusinessMedia, type BusinessMediaKind } from "@/services/business.service";

type Props = {
  media: BusinessMedia[];
  onChange: (media: BusinessMedia[]) => void;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function MediaCard({ media, onChange }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<BusinessMediaKind>("photo");
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError(t("business.mediaInvalidType"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("business.mediaTooLarge"));
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const uploaded = await businessService.uploadImage(file);
      const saved = await businessService.addMedia({
        url: uploaded.url,
        kind,
        altText: altText.trim() || undefined
      });
      onChange([...media, saved]);
      setAltText("");
    } catch (cause) {
      setError((cause as Error).message || t("business.mediaUploadError"));
    } finally {
      setBusy(false);
    }
  };

  const changeKind = async (item: BusinessMedia, nextKind: BusinessMediaKind) => {
    if (item.kind === nextKind) return;
    setError(null);
    setBusy(true);
    try {
      const updated = await businessService.updateMedia(item.id, { kind: nextKind });
      onChange(media.map((entry) => entry.id === updated.id ? updated :
        (nextKind === "cover" || nextKind === "logo") && entry.kind === nextKind
          ? { ...entry, kind: "photo" }
          : entry));
    } catch (cause) {
      setError((cause as Error).message || t("business.mediaUploadError"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: BusinessMedia) => {
    setError(null);
    setRemovingId(item.id);
    try {
      await businessService.deleteMedia(item.id);
      onChange(media.filter((entry) => entry.id !== item.id));
    } catch (cause) {
      setError((cause as Error).message || t("business.mediaUploadError"));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="pk-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="pk-micro">{t("business.mediaTitle")}</h2>
          <p className="mt-1 text-sm text-ink-500">{t("business.mediaHint")}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={addImage}
        />
        <button
          type="button"
          disabled={busy || media.length >= 20}
          onClick={() => inputRef.current?.click()}
          className="pk-btn pk-btn-primary pk-btn-sm"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          {t("business.mediaAdd")}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="space-y-1.5">
          <span className="pk-label">{t("business.mediaKind")}</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as BusinessMediaKind)} className="pk-input">
            <option value="photo">{t("business.mediaKinds.photo")}</option>
            <option value="cover">{t("business.mediaKinds.cover")}</option>
            <option value="logo">{t("business.mediaKinds.logo")}</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="pk-label">{t("business.mediaAlt")}</span>
          <input
            value={altText}
            maxLength={255}
            onChange={(event) => setAltText(event.target.value)}
            className="pk-input"
            placeholder={t("business.mediaAltPlaceholder")}
          />
        </label>
      </div>

      {error ? <p role="alert" className="mt-3 text-sm font-medium text-signal-danger">{error}</p> : null}

      {media.length ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <li key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-ink-100 p-2.5">
              <div
                role="img"
                aria-label={item.altText || t("business.mediaImage")}
                className="size-14 shrink-0 rounded-lg bg-ink-100 bg-cover bg-center"
                style={{ backgroundImage: `url("${item.url.replaceAll('"', "%22")}")` }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.altText || t("business.mediaImage")}</p>
                <label className="sr-only" htmlFor={`media-kind-${item.id}`}>{t("business.mediaKind")}</label>
                <select
                  id={`media-kind-${item.id}`}
                  disabled={busy}
                  value={item.kind}
                  onChange={(event) => changeKind(item, event.target.value as BusinessMediaKind)}
                  className="mt-1 max-w-full rounded-md border border-ink-200 bg-white px-2 py-1 text-xs text-ink-600"
                >
                  <option value="photo">{t("business.mediaKinds.photo")}</option>
                  <option value="cover">{t("business.mediaKinds.cover")}</option>
                  <option value="logo">{t("business.mediaKinds.logo")}</option>
                </select>
              </div>
              <button
                type="button"
                aria-label={`${t("business.mediaRemove")}: ${item.altText || t("business.mediaImage")}`}
                disabled={busy || removingId !== null}
                onClick={() => remove(item)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-signal-danger-soft hover:text-signal-danger disabled:opacity-50"
              >
                {removingId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-500">{t("business.mediaEmpty")}</p>
      )}
    </section>
  );
}
