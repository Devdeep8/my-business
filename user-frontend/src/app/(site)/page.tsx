import type { Metadata } from "next";
import { HomeView } from "@/views/site/HomeView";

export const metadata: Metadata = {
  title: "Pachankaun — Business Profiles",
  description:
    "Free business profiles for local businesses — details tailored to your business category.",
  alternates: { canonical: "/" }
};

export default function HomePage() {
  return <HomeView />;
}
