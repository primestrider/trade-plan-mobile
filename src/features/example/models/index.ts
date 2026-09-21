import type { LinkProps } from "expo-router";

import type { TranslationKey } from "@/shared/models/i18n";

/**
 * Every page the example feature owns.
 *
 * Expo Router addresses screens by path, not by name, so this enum is for
 * referring to a page in code — nav lists, analytics, tests — without spelling
 * the path out again each time.
 */
export enum ExamplePageName {
  INDEX = "ExampleIndex",
  COLORS = "ExampleColors",
  TYPOGRAPHY = "ExampleTypography",
  SPACING = "ExampleSpacing",
  LAYOUT = "ExampleLayout",
  SIZING = "ExampleSizing",
  APPEARANCE = "ExampleAppearance",
  HELPERS = "ExampleHelpers",
  THEME = "ExampleTheme",
  FORM = "ExampleForm",
  COMPONENTS = "ExampleComponents",
  FEATURES = "ExampleFeatures",
  SIGN_IN = "ExampleSignIn",
  PRODUCTS = "ExampleProducts",
  PRODUCT_DETAIL = "ExampleProductDetail",
  TODOS = "ExampleTodos",
  SETTINGS = "ExampleSettings",
}

/**
 * A route target Expo Router accepts.
 *
 * Typed routes are on, and the generated union only covers files the dev
 * server has already seen — so paths are asserted once, in `routes/index.ts`,
 * instead of at every call site.
 */
export type ExampleHref = LinkProps["href"];

/** A row in the utility-styling index. */
export type ExampleNavItem = {
  name: ExamplePageName;
  href: ExampleHref;
  title: string;
  description: string;
  utilities: string[];
};

/** A row in the component-library index. */
export type ComponentGroup = {
  name: ExamplePageName;
  href: ExampleHref;
  title: string;
  description: string;
  components: string[];
};

/**
 * A row in the feature index.
 *
 * `titleKey` / `descriptionKey` rather than finished strings: these are app
 * copy, so they follow the active language. Typing them as `TranslationKey`
 * means a stale key fails the build instead of rendering a dotted path.
 */
export type FeatureNavItem = {
  name: ExamplePageName;
  href: ExampleHref;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  plugins: string[];
};
