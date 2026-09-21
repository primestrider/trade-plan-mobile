import { OnboardingScreen } from "@/features/onboarding/components/OnboardingScreen";

/**
 * Gives onboarding a place in the navigator that `src/app/_layout.tsx` can
 * guard by name. The screen itself lives in the feature, where it can be
 * tested without a router around it.
 */
export default function Onboarding() {
  return <OnboardingScreen />;
}
