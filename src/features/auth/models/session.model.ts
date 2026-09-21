/** The signed-in person, as every screen in the app sees them. */
export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

/** What the backend hands back in exchange for credentials. */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type SignInCredentials = {
  username: string;
  password: string;
};

/**
 * Why a session ended. `expired` is the only one the app announces — a
 * deliberate sign-out needs no explanation.
 */
export type SignOutReason = "user" | "expired";

/**
 * The seam between this feature and whatever backend the app talks to.
 *
 * Register one at boot with `registerAuthAdapter()`. Swapping backends means
 * writing a new adapter; the guard, the store, and the interceptor never
 * learn that anything changed.
 */
export type AuthAdapter = {
  signIn: (
    credentials: SignInCredentials,
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  refresh: (refreshToken: string) => Promise<AuthTokens>;
};
