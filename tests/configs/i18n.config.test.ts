import {
  fallbackLanguage,
  isSupportedLanguage,
  languageNames,
  localeTags,
  supportedLanguages,
} from "../../configs/i18n.config";

describe("i18n config", () => {
  it("ships the languages the app advertises natively", () => {
    expect(supportedLanguages).toEqual(["en", "id"]);
  });

  it("uses a fallback that is itself supported", () => {
    expect(supportedLanguages).toContain(fallbackLanguage);
  });

  it("defines a locale tag and display name for every language", () => {
    for (const language of supportedLanguages) {
      expect(localeTags[language]).toBeTruthy();
      expect(languageNames[language]).toBeTruthy();
    }
  });

  describe("isSupportedLanguage", () => {
    it.each(supportedLanguages)("accepts %s", (language) => {
      expect(isSupportedLanguage(language)).toBe(true);
    });

    it.each([
      ["an unsupported language", "fr"],
      ["a region-qualified tag", "en-US"],
      ["an empty string", ""],
      ["null", null],
      ["undefined", undefined],
      ["a number", 1],
      ["an object", {}],
    ])("rejects %s", (_label, value) => {
      expect(isSupportedLanguage(value)).toBe(false);
    });
  });
});
