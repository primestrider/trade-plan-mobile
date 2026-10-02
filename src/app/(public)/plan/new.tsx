import { useLocalSearchParams } from "expo-router";

import { PlanFormScreen } from "@/features/trade-log/components/PlanFormScreen";

/**
 * Writes a new plan. Opened from a stock's page with `?code=BBCA`, the code is
 * fixed; opened from the trade log without one, the user types it in.
 */
export default function NewPlan() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  return <PlanFormScreen code={code?.toUpperCase()} />;
}
