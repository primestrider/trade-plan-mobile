/// <reference types="node" />
// Node's own types are not in tsconfig's `types` list — deliberately, so React
// Native code cannot pick up Node globals by accident. Pulled in here alone,
// because reading the real `src/app` tree off disk is the point of this suite.
import fs from "fs";
import path from "path";

import type { RouteNode } from "expo-router/build/Route";
import { getRoutes } from "expo-router/build/getRoutesCore";

/**
 * Route *resolution*, run for real.
 *
 * `tests/app/guard.test.tsx` mocks `expo-router` wholesale, so it proves how
 * `src/app/_layout.tsx` wires its guards but says nothing about whether the
 * names it guards resolve to route nodes at all. That gap hid a live bug: a
 * group without its own `_layout` is hoisted into the parent navigator under a
 * compound name (`(protected)/account`), leaving no node called `(protected)`
 * for `<Stack.Protected>` to remove — so the guard silently protected nothing.
 *
 * These tests therefore drive expo-router's own `getRoutes()` over the real
 * `src/app` file tree, read off disk at run time. Nothing about naming or
 * hoisting is re-implemented here; adding or removing a `_layout.tsx` changes
 * the answers.
 */
const APP_DIR = path.resolve(__dirname, "../../src/app");

const ROUTE_FILE = /\.[jt]sx?$/;

/** The context-module keys Metro would hand the router, e.g. `./sign-in.tsx`. */
function routeFileKeys(dir: string, prefix = "."): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const key = `${prefix}/${entry.name}`;

      if (entry.isDirectory()) return routeFileKeys(path.join(dir, entry.name), key);

      return ROUTE_FILE.test(entry.name) ? [key] : [];
    });
}

/**
 * Resolves `src/app` the way the router does at startup.
 *
 * `loadRoute` is never called: these assertions are about names and nesting,
 * and importing every screen would drag the whole app into this suite.
 */
function resolveAppRoutes(): RouteNode {
  const keys = routeFileKeys(APP_DIR);

  const contextModule = Object.assign(() => ({ default: () => null }), {
    keys: () => keys,
    resolve: (id: string) => id,
    id: "app",
  });

  const root = getRoutes(contextModule, {
    ignoreRequireErrors: true,
    // Entry points are a bundler concern, and crawling for them loads routes.
    ignoreEntryPoints: true,
    platform: "ios",
    getSystemRoute: ({ route, type }) => ({
      type: type ?? "route",
      loadRoute: () => ({ default: () => null }),
      route,
      contextKey: `./${route}.tsx`,
      children: [],
      dynamic: null,
      generated: true,
    }),
  });

  if (!root) throw new Error("expo-router resolved no routes from src/app");

  return root;
}

const rootChildNames = (): string[] =>
  resolveAppRoutes().children.map((child) => child.route);

describe("the (protected) group", () => {
  /**
   * The name in `<Stack.Protected guard={isAuthenticated}>` at
   * `src/app/_layout.tsx` must be a name the root navigator actually knows.
   * `useScreens` removes a guarded screen by matching `route` exactly (or
   * with a trailing `/index` stripped), so a near-miss removes nothing.
   */
  it("resolves to a root route node of its own", () => {
    expect(rootChildNames()).toContain("(protected)");
  });

  it("keeps account inside the group rather than hoisting it to the root", () => {
    const group = resolveAppRoutes().children.find(
      (child) => child.route === "(protected)",
    );

    expect(group?.children.map((child) => child.route)).toContain("account");
    expect(rootChildNames()).not.toContain("(protected)/account");
  });

  /**
   * The removal test from `expo-router/build/useScreens.js`, applied to the
   * name resolution really produces. Guarding a name that survives this filter
   * is the bug above, restated as the router sees it.
   */
  it("is removed from the navigator when its guard is closed", () => {
    const protectedScreens = new Set(["(protected)"]);

    const kept = rootChildNames().filter(
      (route) =>
        !protectedScreens.has(route) &&
        !protectedScreens.has(route.replace(/\/index$/, "")),
    );

    expect(kept).not.toContain("(protected)");
    expect(kept.some((route) => route.startsWith("(protected)"))).toBe(false);
  });
});

describe("the (public) group", () => {
  /**
   * Deliberately left without a `_layout.tsx`: see the comment at
   * `src/app/_layout.tsx`. Its screens are hoisted into the root navigator, so
   * `<Stack.Screen name="(public)">` configures the home screen alone. That is
   * harmless because `(public)` is never guarded — but it is only harmless
   * while it stays unguarded, which is what this test pins down.
   */
  it("is hoisted into the root navigator, so only (public)/index exists", () => {
    const names = rootChildNames();

    expect(names).toContain("(public)/index");
    expect(names).not.toContain("(public)");
  });
});
