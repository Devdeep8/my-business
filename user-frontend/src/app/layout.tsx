import type { Metadata, Viewport } from "next";
import { Inter, Yatra_One, Anton, Mukta } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n";

// Operator app: Inter — the modern UI face
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Painted Board world (public site): Yatra One — brush-painted Devanagari
// display; Anton — wood-type Latin caps; Mukta — Devanagari body face.
const yatra = Yatra_One({
  variable: "--font-yatra",
  subsets: ["latin", "devanagari"],
  display: "swap",
  weight: ["400"],
});
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});
const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  // The site has its own हिंदी/English toggle; stop Chrome's
  // translate-this-page prompt from appearing on every refresh.
  other: { google: "notranslate" },
  applicationName: "Pachankaun",
  title: {
    default: "Pachankaun — Business Profiles",
    template: "%s",
  },
  description: "Free business profiles — details tailored to your business category",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="hi"
      className={cn("h-full antialiased", inter.variable, yatra.variable, anton.variable, mukta.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
