"use client";

// src/views/LoginView.tsx
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { authStore, useAuthStore } from "@/store/auth.store";

export function LoginView() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const { hydrated, authenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in (e.g. navigated back to /login) -> straight to dashboard
  useEffect(() => {
    if (hydrated && authenticated) router.replace("/dashboard");
  }, [hydrated, authenticated, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await authStore.login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch {
      setError(t("login.error"));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="pk-mark mb-4 size-12 rounded-xl text-xl">प</div>
          <h1 className="text-xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("login.subtitle")}</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="pk-card p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="pk-label">{t("login.email")}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                className="pk-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="pk-label">{t("login.password")}</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="pk-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-(--radius-field) bg-signal-danger-soft px-3 py-2.5 text-sm font-medium text-signal-danger">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="pk-btn pk-btn-primary mt-6 w-full">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>

          <p className="mt-5 text-center text-sm text-ink-500">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="pk-link">{t("login.registerLink")}</Link>
          </p>
        </form>

        <div className="mt-5 text-center">
          <button type="button" onClick={() => setLang(lang === "hi" ? "en" : "hi")} className="pk-lang">
            {t("common.languageName")}
          </button>
        </div>
      </div>
    </main>
  );
}
