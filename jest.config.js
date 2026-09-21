/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",

  // Tests live in a single tree that mirrors `src/`.
  roots: ["<rootDir>/tests"],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  moduleNameMapper: {
    // `xcode` (via expo/config-plugins) requires uuid from Node. The root
    // `overrides` pin uuid to v11 for GHSA-w5hq-g745-h8pq, and v11 only ships
    // ESM under Jest's React Native export conditions. Resolve it the way Node
    // itself does, to the CommonJS build.
    "^uuid$": require.resolve("uuid"),

    // Mirrors the `paths` entries in tsconfig.json — Jest does not read them.
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "configs/**/*.ts",
    "!src/app/**",
    "!src/example/**",
    "!**/index.ts",
  ],
};
