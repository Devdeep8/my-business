import type { Metadata } from "next";
import { DirectoryView } from "@/views/site/DirectoryView";
import { publicBusinessService } from "@/services/publicBusiness.service";

export const metadata: Metadata = {
  title: "Browse local businesses | Pachankaun",
  description: "Find local businesses and view their complete profiles on Pachankaun."
};

export default async function BrowsePage() {
  const [page, categories] = await Promise.all([
    publicBusinessService.list({ page: 1, limit: 12 }).catch(() => null),
    publicBusinessService.listCategories().then((result) => result.items).catch(() => [])
  ]);
  return <DirectoryView initialPage={page} initialCategories={categories} />;
}
