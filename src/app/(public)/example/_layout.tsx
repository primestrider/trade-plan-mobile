import { Stack } from "expo-router";

import { useTheme } from "@/styles";
import { fontFamily } from "@/styles/tokens";

export default function ExampleLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: fontFamily.semibold },
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: "Back",
      }}
    />
  );
}
