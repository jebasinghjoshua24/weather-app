import { describe, it, expect } from "vitest";
import { getAuraPalette } from "@/lib/aura";
import { getSkyScene } from "@/lib/sky";

describe("getAuraPalette", () => {
  it("returns warm gold for clear day", () => {
    const scene = getSkyScene(0, 1);
    const pal = getAuraPalette(scene, 0);
    expect(pal.primary).toContain("38");
    expect(pal.primary).toContain("72");
  });

  it("returns cool silver for overcast", () => {
    const scene = getSkyScene(3, 1);
    const pal = getAuraPalette(scene, 3);
    expect(pal.primary).toContain("210");
    expect(pal.primary).toContain("82");
  });

  it("returns blue-toned for storm", () => {
    const scene = getSkyScene(95, 1);
    const pal = getAuraPalette(scene, 95);
    expect(pal.primary).toContain("235");
  });

  it("returns default for undefined code", () => {
    const scene = getSkyScene(undefined, 1);
    const pal = getAuraPalette(scene, undefined);
    expect(pal.primary).toBeTruthy();
  });
});