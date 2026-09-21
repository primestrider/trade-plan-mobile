import { onboardingSchema } from "@/features/onboarding/models/form.schema";

/**
 * The schema stores translation *keys* rather than finished sentences, so the
 * assertions below name keys too — see `src/shared/models/i18n.ts` for why.
 */
const firstIssue = (input: unknown) => {
  const result = onboardingSchema.safeParse(input);

  if (result.success)
    throw new Error("expected the schema to reject the input");

  return result.error.issues[0];
};

const valid = { name: "Prime", balance: "10000000" };

describe("name", () => {
  it("is trimmed before it reaches the store", () => {
    const result = onboardingSchema.safeParse({ ...valid, name: "  Prime  " });

    expect(result.success).toBe(true);
    expect(result.success && result.data.name).toBe("Prime");
  });

  it("is rejected when trimming leaves fewer than two characters", () => {
    expect(firstIssue({ ...valid, name: " P " }).message).toBe(
      "features.onboarding.validation.nameMin",
    );
  });

  it("is rejected past fifty characters", () => {
    expect(firstIssue({ ...valid, name: "a".repeat(51) }).message).toBe(
      "features.onboarding.validation.nameMax",
    );
  });

  it("reports the field it belongs to", () => {
    expect(firstIssue({ ...valid, name: "" }).path).toEqual(["name"]);
  });
});

describe("balance", () => {
  it("accepts a positive whole number of rupiah", () => {
    expect(onboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("is rejected when left empty", () => {
    expect(firstIssue({ ...valid, balance: "" }).message).toBe(
      "features.onboarding.validation.balanceRequired",
    );
  });

  it("is rejected at zero, because a trading plan needs capital", () => {
    expect(firstIssue({ ...valid, balance: "0" }).message).toBe(
      "features.onboarding.validation.balanceMin",
    );
  });

  /**
   * `Input type="currency"` strips everything but digits and `.`, so a decimal
   * point is the one stray character that can still arrive. Rupiah is written
   * without decimals, so it is rejected rather than rounded.
   */
  it("is rejected when it carries decimals", () => {
    expect(firstIssue({ ...valid, balance: "10.5" }).message).toBe(
      "features.onboarding.validation.balanceInvalid",
    );
  });
});
