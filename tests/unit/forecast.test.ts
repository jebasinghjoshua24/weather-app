import { describe, it, expect } from "vitest";
import { forecastIndices, nextHoursLabel } from "@/lib/forecast";

describe("forecastIndices", () => {
  it("returns 3,6,9,12", () => {
    expect(forecastIndices()).toEqual([3, 6, 9, 12]);
  });
});

describe("nextHoursLabel", () => {
  it("formats ISO time to hour", () => {
    const label = nextHoursLabel("2026-09-02T15:00:00Z");
    expect(label).toBeTruthy();
    expect(label).not.toBe("--");
  });
  it("returns -- for invalid", () => {
    expect(nextHoursLabel("bad")).toBe("--");
  });
});
