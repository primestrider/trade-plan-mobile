import { act } from "@testing-library/react-native";

import { buildBackup } from "@/features/settings/models/backup";
import { restoreBackup } from "@/features/settings/services/backup";
import { usePlanStore } from "@/features/trade-log/stores/plan.store";
import { useProfileStore } from "@/shared/stores";

jest.mock("expo-document-picker", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-file-system", () => ({}));

it("replaces the profile and every plan, and opens the onboarding gate", () => {
  act(() => {
    useProfileStore.setState({ name: "", balance: 0, hasCompletedOnboarding: false });
    usePlanStore.setState({ plans: [] });
  });

  act(() =>
    restoreBackup(
      buildBackup(
        { name: "Ricky", balance: 5_000_000, riskPercent: 9, streakGuard: false },
        [],
      ),
    ),
  );

  expect(useProfileStore.getState()).toMatchObject({
    name: "Ricky",
    balance: 5_000_000,
    riskPercent: 5,
    streakGuard: false,
    hasCompletedOnboarding: true,
  });
});
