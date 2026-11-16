import type { Metadata, Viewport } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n";

// Operator app: Inter for Latin, Noto Sans Devanagari for Hindi — one
// voice, bilingual.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // The site has its own हिंदी/English toggle; stop Chrome's
  // translate-this-page prompt from appearing on every refresh.
  other: { google: "notranslate" },
  applicationName: "Pachankaun",
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: {
    default: "Pachankaun — Business Profiles",
    template: "%s | Pachankaun",
  },
  description: "Free business profiles — details tailored to your business category",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="hi"
      className={cn("h-full antialiased", inter.variable, mukta.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
