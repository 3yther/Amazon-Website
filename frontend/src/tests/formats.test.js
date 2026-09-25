import { describe, expect, it } from "vitest";
import { formatDate, formatNumber } from "../formats.js";

// 31 January 2026, midday, so no time zone can move it to another day.
const WHEN = new Date(2026, 0, 31, 12, 0, 0);

describe("formatDate", () => {
  it("writes dates the UK way, DD/MM/YYYY", () => {
    expect(formatDate(WHEN)).toBe("31/01/2026");
    expect(formatDate("2026-09-01T12:00:00")).toBe("01/09/2026");
  });

  it("prints nothing for a missing or broken date", () => {
    for (const value of [null, undefined, "", "not a date"]) {
      expect(formatDate(value)).toBe("");
    }
  });
});

describe("formatNumber", () => {
  it("uses UK separators", () => {
    expect(formatNumber(23)).toBe("23");
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(1234.56)).toBe("1,234.56");
  });

  it("prints nothing for something that is not a number", () => {
    expect(formatNumber(undefined)).toBe("");
    expect(formatNumber("12")).toBe("");
  });
});
