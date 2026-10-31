import type { Metadata } from "next";
import { DashboardView } from "@/views/DashboardView";

export const metadata: Metadata = {
  title: "My Business | Pachankaun",
  description: "Your business profile — status, completeness and links",
};

export default function DashboardPage() {
  return <DashboardView />;
}
