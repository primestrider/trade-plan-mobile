import { useLocalSearchParams } from "expo-router";

import { PlanDetailScreen } from "@/features/trade-log/components/PlanDetailScreen";

/** One plan's page. The screen itself lives in the feature. */
export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlanDetailScreen id={id} />;
}
