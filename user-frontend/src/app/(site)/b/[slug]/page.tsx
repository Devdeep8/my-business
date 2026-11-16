import type { Metadata } from "next";
import { BusinessProfileView } from "@/views/site/BusinessProfileView";
import { publicBusinessService } from "@/services/publicBusiness.service";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await publicBusinessService.get(slug).catch(() => null);
  return {
    title: business ? `${business.name} | Pachankaun` : "Business profile | Pachankaun",
    description: business?.description || "Business details, contact options, and category-specific information.",
    alternates: { canonical: `/b/${encodeURIComponent(slug)}` },
    ...(business?.cover?.url ? { openGraph: { images: [business.cover.url] } } : {})
  };
}

export default async function PublicBusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const initialBusiness = await publicBusinessService.get(slug).catch(() => null);
  return <BusinessProfileView slug={slug} initialBusiness={initialBusiness} />;
}
