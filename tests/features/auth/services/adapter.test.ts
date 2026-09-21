import type { AuthAdapter } from "@/features/auth/models/session.model";
import {
  getAuthAdapter,
  registerAuthAdapter,
  resetAuthAdapter,
} from "@/features/auth/services/adapter";

const adapter: AuthAdapter = {
  signIn: jest.fn(),
  refresh: jest.fn(),
};

beforeEach(() => {
  resetAuthAdapter();
});

describe("auth adapter registry", () => {
  it("hands back the adapter that was registered", () => {
    registerAuthAdapter(adapter);

    expect(getAuthAdapter()).toBe(adapter);
  });

  it("explains itself when nothing was registered", () => {
    expect(() => getAuthAdapter()).toThrow(/registerAuthAdapter/);
  });

  it("lets a later registration replace an earlier one", () => {
    const replacement: AuthAdapter = { signIn: jest.fn(), refresh: jest.fn() };

    registerAuthAdapter(adapter);
    registerAuthAdapter(replacement);

    expect(getAuthAdapter()).toBe(replacement);
  });
});
