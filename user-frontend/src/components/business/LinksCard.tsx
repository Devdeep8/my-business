"use client";

// src/components/business/LinksCard.tsx
// The owner's linktree-style links: inline add form + live list with
// delete. The whole manager lives in the card — no modal round-trip.
import { useState, type FormEvent } from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { safeHttpUrl } from "@/lib/publicUrl";
import {
  businessService,
  type BusinessLink,
  type LinkType
} from "@/services/business.service";

const LINK_TYPES: LinkType[] = [
  "website", "whatsapp", "instagram", "facebook",
  "youtube", "booking", "menu", "map", "custom"
];

type Props = {
  links: BusinessLink[];
  onChange: (links: BusinessLink[]) => void;
};

export function LinksCard({ links, onChange }: Props) {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LinkType>("website");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    if (adding) return;
    setError(null);

    const cleanUrl = url.trim();
    if (!title.trim()) {
      setError(t("onboarding.errors.required"));
      return;
    }
    if (!/^https?:\/\/.+/.test(cleanUrl)) {
      setError(t("onboarding.errors.url"));
      return;
    }

    setAdding(true);
    try {
      const created = await businessService.createLink({
        type,
        url: cleanUrl,
        title: title.trim()
      });
      onChange([...links, created]);
      setTitle("");
      setUrl("");
      setOpen(false);
    } catch (e) {
      setError((e as Error).message || t("onboarding.errors.submit"));
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    setRemovingId(id);
    try {
      await businessService.deleteLink(id);
      onChange(links.filter((link) => link.id !== id));
    } catch {
      setError(t("onboarding.errors.submit"));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="pk-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="pk-micro">{t("business.links")}</h2>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-angaar-600 transition-colors hover:bg-angaar-50"
          >
            <Plus className="size-3.5" />
            {t("business.linksAdd")}
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={add} className="mt-4 space-y-3">
          <div>
            <label htmlFor="link-type" className="pk-label">{t("business.linkType")}</label>
            <select
              id="link-type"
              value={type}
              onChange={(e) => setType(e.target.value as LinkType)}
              className="pk-input cursor-pointer appearance-none"
            >
              {LINK_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`business.linkTypes.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="link-title" className="pk-label">{t("business.linkTitle")}</label>
            <input
              id="link-title"
              className="pk-input"
              value={title}
              maxLength={255}
              placeholder={t("business.linkTitlePlaceholder")}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="link-url" className="pk-label">{t("business.linkUrl")}</label>
            <input
              id="link-url"
              className="pk-input"
              value={url}
              inputMode="url"
              maxLength={500}
              placeholder={t("business.linkUrlPlaceholder")}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs font-medium text-signal-danger">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); }}
              className="pk-btn pk-btn-ghost pk-btn-sm"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={adding} className="pk-btn pk-btn-primary pk-btn-sm">
              {adding ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {adding ? t("business.linksAdding") : t("business.add")}
            </button>
          </div>
        </form>
      ) : null}

      {links.length === 0 && !open ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{t("business.noLinks")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {links.map((link) => (
            <li key={link.id} className="group/link flex items-center gap-2 py-2">
              {safeHttpUrl(link.url) ? (
              <a
                href={safeHttpUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 flex-1 items-center justify-between gap-3 py-0.5"
              >
                <span className="min-w-0 truncate text-sm font-medium text-ink-900 transition-colors group-hover:text-angaar-600">
                  {link.title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <ExternalLink className="size-3.5 text-ink-300 transition-colors group-hover:text-angaar-600" />
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-ink-500 uppercase">
                    {t(`business.linkTypes.${link.type}`)}
                  </span>
                </span>
              </a>
              ) : <span className="min-w-0 flex-1 truncate text-sm text-ink-400">{link.title}</span>}
              <button
                type="button"
                aria-label={`${t("business.remove")}: ${link.title}`}
                onClick={() => remove(link.id)}
                disabled={removingId !== null}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-300 transition-colors hover:bg-signal-danger-soft hover:text-signal-danger disabled:opacity-50"
              >
                {removingId === link.id
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <Trash2 className="size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
