import type { Metadata } from "next";
import OnboardingView from "@/components/onboarding/onboarding-view";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return <OnboardingView />;
}