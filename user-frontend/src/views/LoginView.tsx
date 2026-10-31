"use client";

// src/views/LoginView.tsx
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { authStore, useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/input";

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
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      {/* Ambient gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-sky-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-950/50">
            प
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("common.appName")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("login.subtitle")}</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                {t("login.email")}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-indigo-400/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                {t("login.password")}
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-indigo-400/50"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:from-indigo-400 hover:to-violet-500 active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>

          <p className="mt-4 text-center text-sm text-slate-400">
            {t("login.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              {t("login.registerLink")}
            </Link>
          </p>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              {t("common.languageName")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
