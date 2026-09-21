import { supportedLanguages } from "../../configs/i18n.config";
import { resources } from "@/locales";

/** Flattens a nested translation object into dotted key paths. */
function keyPaths(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof child === "object" && child !== null
      ? keyPaths(child, path)
      : [path];
  });
}

/** Reads a dotted key path out of a translation object. */
function valueAt(value: object, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (current, key) => (current as Record<string, unknown>)?.[key],
      value,
    );
}

/** Interpolation placeholders such as `{{field}}`. */
function placeholders(value: string): string[] {
  return (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();
}

const referenceLanguage = "en";
const referencePaths = keyPaths(resources[referenceLanguage]);

describe("translation resources", () => {
  it("provides a bundle for every supported language", () => {
    expect(Object.keys(resources).sort()).toEqual([...supportedLanguages].sort());
  });

  it("has translations to check", () => {
    expect(referencePaths.length).toBeGreaterThan(0);
  });

  describe.each(supportedLanguages)("%s", (language) => {
    const bundle = resources[language];

    it("defines exactly the same keys as the reference language", () => {
      expect(keyPaths(bundle).sort()).toEqual([...referencePaths].sort());
    });

    it.each(referencePaths)("has a non-empty string at %s", (path) => {
      const value = valueAt(bundle, path);

      expect(typeof value).toBe("string");
      expect((value as string).trim()).not.toBe("");
    });

    it("keeps the same interpolation placeholders as the reference", () => {
      for (const path of referencePaths) {
        expect({
          path,
          placeholders: placeholders(valueAt(bundle, path) as string),
        }).toEqual({
          path,
          placeholders: placeholders(
            valueAt(resources[referenceLanguage], path) as string,
          ),
        });
      }
    });
  });
});
