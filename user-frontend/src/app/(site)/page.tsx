import type { Metadata } from "next";
import { HomeView } from "@/views/site/HomeView";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pachankaun | Discover and list local businesses",
  description:
    "Create a business profile on Pachankaun and help people discover local businesses through relevant business information and recommendations.",
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL), alternates: { canonical: "/" } } : {}),
};

export default function Page() {
  return <HomeView />;
}
