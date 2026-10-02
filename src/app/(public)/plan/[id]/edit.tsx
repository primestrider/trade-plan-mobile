import { useLocalSearchParams } from "expo-router";

import { PlanFormScreen } from "@/features/trade-log/components/PlanFormScreen";

/** Edits a plan's prices with the same form that wrote it. */
export default function EditPlan() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlanFormScreen planId={id} />;
}
