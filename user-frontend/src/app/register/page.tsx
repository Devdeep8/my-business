import type { Metadata } from "next";
import { RegisterView } from "@/views/RegisterView";

export const metadata: Metadata = {
  title: "Create your account | Pachankaun",
  description: "Register and add your business for free",
};

export default function RegisterPage() {
  return <RegisterView />;
}
