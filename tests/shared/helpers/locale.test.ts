import { enUS, id as idID } from "date-fns/locale";

import { fallbackLanguage } from "../../../configs/i18n.config";
import {
  getActiveLanguage,
  getDateLocale,
  getIntlLocale,
  setActiveLanguage,
} from "@/shared/helpers/locale";

afterEach(() => {
  setActiveLanguage(fallbackLanguage);
});

describe("active language", () => {
  it("starts on the fallback language", () => {
    expect(getActiveLanguage()).toBe(fallbackLanguage);
  });

  it("switches to a supported language", () => {
    setActiveLanguage("id");
    expect(getActiveLanguage()).toBe("id");
  });

  it.each([
    ["an unsupported language", "fr"],
    ["a region-qualified tag", "en-US"],
    ["an empty string", ""],
  ])("ignores %s", (_label, value) => {
    setActiveLanguage("id");
    setActiveLanguage(value);

    expect(getActiveLanguage()).toBe("id");
  });
});

describe("getIntlLocale", () => {
  it("maps the active language to a BCP-47 tag", () => {
    expect(getIntlLocale()).toBe("en-US");

    setActiveLanguage("id");
    expect(getIntlLocale()).toBe("id-ID");
  });

  it("accepts an explicit override", () => {
    expect(getIntlLocale("id")).toBe("id-ID");
  });
});

describe("getDateLocale", () => {
  it("maps the active language to a date-fns locale", () => {
    expect(getDateLocale()).toBe(enUS);

    setActiveLanguage("id");
    expect(getDateLocale()).toBe(idID);
  });

  it("accepts an explicit override", () => {
    expect(getDateLocale("id")).toBe(idID);
  });
});
