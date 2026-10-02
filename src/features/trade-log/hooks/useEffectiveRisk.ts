import { useProfileStore } from "@/shared/stores";

import { effectiveRisk } from "../models/plan";
import { usePlanStore } from "../stores/plan.store";

/**
 * The risk per trade that applies right now, streak guard included. Every
 * place that sizes a trade or shows the limit reads it from here, so the
 * guard cannot be honoured on one screen and missed on another.
 */
export function useEffectiveRisk() {
  const plans = usePlanStore((state) => state.plans);
  const riskPercent = useProfileStore((state) => state.riskPercent);
  const streakGuard = useProfileStore((state) => state.streakGuard);

  return effectiveRisk(plans, riskPercent, streakGuard);
}
