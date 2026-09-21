// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // `.agents` and `.opencode` hold agent tooling scripts, not app source —
    // they follow their own conventions and are not ours to lint.
    ignores: ["dist/*", ".agents/**", ".opencode/**"],
  },
  {
    files: ["tests/**"],
    rules: {
      // Jest hoists `jest.mock` above the imports, so a mock factory has to
      // pull its replacement in lazily with `require` — an ES import would be
      // evaluated too late to stand in for the real module.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
