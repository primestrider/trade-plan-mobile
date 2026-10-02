/**
 * Global Jest setup.
 *
 * Only native modules that cannot run inside Jest are mocked here; everything
 * else is exercised for real so the tests reflect actual app behavior.
 */

// `Input` calls `useResizeMode()` and `KeyboardController.dismiss()`, both of
// which need the native keyboard module. The library ships its own mock.
jest.mock("react-native-keyboard-controller", () =>
  require("react-native-keyboard-controller/jest"),
);

// `Screen` reads safe-area insets, which are measured natively. The library's
// own mock reports a fixed inset, so layout assertions stay deterministic.
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

// MMKV is a Nitro native module with no JS fallback, and `@/styles` now reaches
// it through the persisted theme store. This in-memory stand-in keeps the real
// storage semantics (synchronous, string values) that the app relies on.
jest.mock("react-native-mmkv", () => {
  const stores = new Map<string, Map<string, string>>();

  return {
    createMMKV: ({ id = "default" }: { id?: string } = {}) => {
      if (!stores.has(id)) stores.set(id, new Map());
      const store = stores.get(id)!;

      return {
        set: (key: string, value: string | number | boolean) =>
          store.set(key, String(value)),
        getString: (key: string) => store.get(key),
        getNumber: (key: string) => Number(store.get(key)),
        getBoolean: (key: string) => store.get(key) === "true",
        contains: (key: string) => store.has(key),
        remove: (key: string) => store.delete(key),
        delete: (key: string) => store.delete(key),
        getAllKeys: () => [...store.keys()],
        clearAll: () => store.clear(),
      };
    },
  };
});

// `@expo/ui` presents its sheet natively (SwiftUI / Compose), which Jest cannot
// do, and its host is `pointerEvents="none"` on the React Native side, which
// would swallow every press inside. The stand-in renders the content inline
// and keeps its props (`isPresented`, `onDismiss`, …) on a node tests can reach, so a user's
// swipe-to-dismiss is `fireEvent(sheet, "dismiss")`.
jest.mock("@expo/ui", () => {
  const { createElement } = require("react");
  const { View } = require("react-native");

  return {
    ...jest.requireActual("@expo/ui"),
    BottomSheet: ({ children, ...props }: any) =>
      createElement(
        View,
        { testID: "native-bottom-sheet", ...props },
        children,
      ),
    RNHostView: ({ children }: any) => children,
    // Native too. The stand-in keeps `value`/`onValueChange` on a reachable
    // node, so a drag is `fireEvent(slider, "valueChange", 3)`.
    Host: ({ children }: any) => createElement(View, null, children),
    Switch: (props: any) =>
      createElement(View, { testID: "native-switch", ...props }),
    Slider: (props: any) =>
      createElement(View, { testID: "native-slider", ...props }),
  };
});

// Google Sign-In is a Nitro native module. The SDK object is all `jest.fn`s
// for tests to script; the response helpers and status codes keep their real
// shapes; the branded button is a pressable stand-in that calls `onPress`.
jest.mock("react-native-nitro-google-signin", () => {
  const { createElement } = require("react");
  const { Pressable } = require("react-native");

  const statusCodes = {
    ONE_TAP_START_FAILED: "ONE_TAP_START_FAILED",
    PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
    IN_PROGRESS: "IN_PROGRESS",
    SIGN_IN_REQUIRED: "SIGN_IN_REQUIRED",
    SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
    DEVELOPER_ERROR: "DEVELOPER_ERROR",
  };

  return {
    statusCodes,
    GOOGLE_SIGN_IN_BUTTON_HEIGHT: 48,
    GoogleOneTapSignIn: {
      configure: jest.fn(),
      checkPlayServices: jest.fn(async () => undefined),
      signIn: jest.fn(),
      createAccount: jest.fn(),
      presentExplicitSignIn: jest.fn(),
      requestScopes: jest.fn(),
      getCurrentUser: jest.fn(() => null),
      getTokens: jest.fn(),
      clearCachedAccessToken: jest.fn(async () => undefined),
      signOut: jest.fn(async () => undefined),
      revokeAccess: jest.fn(async () => undefined),
    },
    isSuccessResponse: (response: any) =>
      response?.type === "success" && response.data != null,
    isNoSavedCredentialFoundResponse: (response: any) =>
      response?.type === "noSavedCredentialFound",
    isCancelledResponse: (response: any) => response?.type === "cancelled",
    isErrorWithCode: (error: any) =>
      error != null && typeof error === "object" && "code" in error,
    GoogleSignInButton: ({ onPress, disabled, testID }: any) =>
      createElement(Pressable, {
        testID,
        onPress,
        disabled,
        accessibilityRole: "button",
        accessibilityLabel: "Sign in with Google",
      }),
  };
});
