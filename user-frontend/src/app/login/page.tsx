import type { Metadata } from "next";
import { LoginView } from "@/views/LoginView";

export const metadata: Metadata = {
  title: "Sign in | Pachankaun",
  description: "Sign in to manage your Pachankaun business profile",
};

export default function LoginPage() {
  return <LoginView />;
}
