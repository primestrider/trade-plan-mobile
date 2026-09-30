import { useLocalSearchParams } from "expo-router";

import { StockDetailScreen } from "@/features/search/components/StockDetailScreen";

/**
 * One stock's detail page, pushed over search. The code comes from the URL,
 * so `/stock/BBCA` also works as a deep link. The screen itself lives in the
 * feature.
 */
export default function StockDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return <StockDetailScreen code={code.toUpperCase()} />;
}
