import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

// Shared public shell for the Pachankaun business discovery platform.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-col bg-white font-sans">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </main>
  );
}
