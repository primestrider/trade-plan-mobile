import { HomeScreen } from "@/features/home/components/HomeScreen";

/**
 * The home route. The screen itself lives in the feature, where it can be
 * tested without a router around it.
 */
export default function Index() {
  return <HomeScreen />;
}
