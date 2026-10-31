import type { Metadata } from "next";
import { OnboardingView } from "@/views/OnboardingView";

export const metadata: Metadata = {
  title: "Add your business | Pachankaun",
  description: "Create your free business profile — details tailored to your business category",
};

export default function OnboardingPage() {
  return <OnboardingView />;
}
