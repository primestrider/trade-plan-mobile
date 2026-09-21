import { renderHook, act } from "@testing-library/react-native";
import { useColorScheme } from "react-native";

import { mmkvStorage, storageKeys } from "@/plugins/mmkv";
import { useStyles, useTheme, useThemeStore } from "@/styles";
import { colors, darkColors } from "@/styles/tokens";

jest.mock("react-native/Libraries/Utilities/useColorScheme");

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

/**
 * Accepts values the type says cannot happen (`undefined`, `"unspecified"`),
 * because the resolver defends against them at runtime.
 */
function setSystemScheme(scheme: unknown) {
  mockedUseColorScheme.mockReturnValue(
    scheme as ReturnType<typeof useColorScheme>,
  );
}

beforeEach(() => {
  setSystemScheme("light");
  act(() => useThemeStore.getState().setMode("system"));
});

describe("scheme resolution", () => {
  it.each([
    ["light", "light"],
    ["dark", "dark"],
  ] as const)("follows the OS when mode is system (%s)", (system, expected) => {
    setSystemScheme(system);

    const { result } = renderHook(() => useTheme());

    expect(result.current.mode).toBe("system");
    expect(result.current.scheme).toBe(expected);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["unspecified", "unspecified"],
  ])("falls back to light when the OS reports %s", (_label, system) => {
    setSystemScheme(system);

    expect(renderHook(() => useTheme()).result.current.scheme).toBe("light");
  });

  it.each(["light", "dark"] as const)(
    "ignores the OS when pinned to %s",
    (mode) => {
      setSystemScheme(mode === "light" ? "dark" : "light");
      act(() => useThemeStore.getState().setMode(mode));

      const { result } = renderHook(() => useTheme());

      expect(result.current.scheme).toBe(mode);
      expect(result.current.isDark).toBe(mode === "dark");
    },
  );

  it("exposes the matching semantic palette", () => {
    setSystemScheme("dark");

    expect(renderHook(() => useTheme()).result.current.colors).toBe(darkColors);

    setSystemScheme("light");

    expect(renderHook(() => useTheme()).result.current.colors).toBe(colors);
  });

  it("reacts to a mode change without remounting", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);

    act(() => result.current.setMode("dark"));

    expect(result.current.scheme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });
});

describe("persistence", () => {
  it("writes the preference under the shared storage key", () => {
    act(() => useThemeStore.getState().setMode("dark"));

    const stored = mmkvStorage.getString(storageKeys.app.theme);

    expect(stored).toBeDefined();
    expect(JSON.parse(stored!).state.mode).toBe("dark");
  });
});

describe("useStyles", () => {
  it("resolves semantic colors for the active scheme", () => {
    setSystemScheme("light");
    expect(renderHook(() => useStyles()).result.current.bgBackground).toEqual({
      backgroundColor: colors.background,
    });

    setSystemScheme("dark");
    expect(renderHook(() => useStyles()).result.current.bgBackground).toEqual({
      backgroundColor: darkColors.background,
    });
  });

  it.each([
    ["textForeground", "color"],
    ["borderBorder", "borderColor"],
    ["bgCard", "backgroundColor"],
  ] as const)("gives %s a different value per scheme", (key, property) => {
    setSystemScheme("light");
    const light = renderHook(() => useStyles()).result.current[key] as Record<
      string,
      string
    >;

    setSystemScheme("dark");
    const dark = renderHook(() => useStyles()).result.current[key] as Record<
      string,
      string
    >;

    expect(light[property]).not.toBe(dark[property]);
  });

  it("shares theme-neutral utilities between both schemes", () => {
    setSystemScheme("light");
    const light = renderHook(() => useStyles()).result.current;

    setSystemScheme("dark");
    const dark = renderHook(() => useStyles()).result.current;

    // Same object identity — layout never gets rebuilt when the theme changes.
    expect(light.p4).toBe(dark.p4);
    expect(light.flexRow).toBe(dark.flexRow);
    expect(light.bgGray100).toBe(dark.bgGray100);
  });

  it("returns one cached object per scheme", () => {
    setSystemScheme("dark");

    expect(renderHook(() => useStyles()).result.current).toBe(
      renderHook(() => useStyles()).result.current,
    );
  });
});
