import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

// Shared public shell: hairline header, roomy content, quiet footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </main>
  );
}
