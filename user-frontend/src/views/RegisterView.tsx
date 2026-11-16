"use client";

// src/views/RegisterView.tsx
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { authStore, useAuthStore } from "@/store/auth.store";

export function RegisterView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { hydrated, authenticated } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in -> straight to onboarding
  useEffect(() => {
    if (hydrated && authenticated) router.replace("/onboarding");
  }, [hydrated, authenticated, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    if (password.length < 8) {
      setError(t("register.shortPassword"));
      return;
    }
    setSubmitting(true);
    try {
      await authStore.register({ name: name.trim(), email: email.trim(), password });
      router.replace("/onboarding");
    } catch (e) {
      setError((e as Error).message || t("register.error"));
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="pk-mark mb-4 size-12 rounded-xl text-xl">प</div>
          <h1 className="text-xl font-semibold tracking-tight">{t("register.title")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("register.subtitle")}</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="pk-card p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="pk-label">{t("register.name")}</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                className="pk-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="pk-label">{t("register.email")}</label>
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
              <label htmlFor="password" className="pk-label">{t("register.password")}</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="pk-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="pk-help">{t("register.passwordHint")}</p>
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-(--radius-field) bg-signal-danger-soft px-3 py-2.5 text-sm font-medium text-signal-danger">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="pk-btn pk-btn-primary mt-6 w-full">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitting ? t("register.submitting") : t("register.submit")}
          </button>

          <p className="mt-5 text-center text-sm text-ink-500">
            {t("register.haveAccount")}{" "}
            <Link href="/login" className="pk-link">{t("register.loginLink")}</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
