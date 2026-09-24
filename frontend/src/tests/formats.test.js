import { describe, expect, it } from "vitest";
import { formatDate, formatNumber } from "../formats.js";

// The Language and region settings used to save and then be read by nothing.
// These cover the functions that finally make the choice visible.

describe("formatDate", () => {
  const WHEN = "2026-01-31T10:00:00Z";

  it("writes the date the way the setting asks", () => {
    expect(formatDate(WHEN, "DD/MM/YYYY")).toBe("31/01/2026");
    expect(formatDate(WHEN, "MM/DD/YYYY")).toBe("01/31/2026");
    expect(formatDate(WHEN, "YYYY-MM-DD")).toBe("2026-01-31");
  });

  it("falls back to the UK order for an unknown or missing setting", () => {
    expect(formatDate(WHEN, "nonsense")).toBe("31/01/2026");
    expect(formatDate(WHEN, undefined)).toBe("31/01/2026");
  });

  it("prints nothing rather than Invalid Date", () => {
    // A half-loaded profile has no date yet, and "Invalid Date" on screen
    // reads like a fault.
    for (const value of [null, undefined, "", "not a date"]) {
      expect(formatDate(value, "DD/MM/YYYY")).toBe("");
    }
  });
});

describe("formatNumber", () => {
  it("writes thousands the way the setting asks", () => {
    expect(formatNumber(1234, "UK")).toBe("1,234");
    expect(formatNumber(1234, "US")).toBe("1,234");
    expect(formatNumber(1234, "EU")).toBe("1.234");
  });

  it("puts the decimal point where the setting asks", () => {
    expect(formatNumber(1234.56, "UK")).toBe("1,234.56");
    expect(formatNumber(1234.56, "EU")).toBe("1.234,56");
  });

  it("leaves small numbers alone, which is most of this site", () => {
    for (const format of ["UK", "US", "EU"]) {
      expect(formatNumber(23, format)).toBe("23");
    }
  });

  it("prints nothing for something that is not a number", () => {
    expect(formatNumber(undefined, "UK")).toBe("");
    expect(formatNumber("12", "UK")).toBe("");
  });
});
