import { groupForCode, type SkyScene } from "@/lib/sky";

export interface AuraPalette {
  primary: string;
  accent: string;
  glow: string;
}

/**
 * Derive aura colors from the weather sky scene.
 * Warm on clear day, cool on overcast/rain, blue on night, silver on snow.
 */
export function getAuraPalette(scene: SkyScene, weatherCode: number | undefined): AuraPalette {
  const group = typeof weatherCode === "number" ? groupForCode(weatherCode) : "default";
  switch (group) {
    case "clear":
      return { primary: "hsl(38 92% 72% / 0.18)", accent: "hsl(38 92% 60% / 0.08)", glow: "hsl(38 92% 80% / 0.04)" };
    case "partly":
      return { primary: "hsl(45 60% 80% / 0.14)", accent: "hsl(210 40% 85% / 0.08)", glow: "hsl(0 0% 100% / 0.04)" };
    case "overcast":
      return { primary: "hsl(210 10% 82% / 0.12)", accent: "hsl(210 8% 90% / 0.06)", glow: "hsl(0 0% 100% / 0.03)" };
    case "rain":
    case "showers":
      return { primary: "hsl(212 22% 68% / 0.12)", accent: "hsl(210 18% 80% / 0.06)", glow: "hsl(210 20% 85% / 0.03)" };
    case "snow":
      return { primary: "hsl(200 10% 94% / 0.14)", accent: "hsl(200 8% 98% / 0.08)", glow: "hsl(200 12% 100% / 0.04)" };
    case "storm":
      return { primary: "hsl(235 18% 48% / 0.12)", accent: "hsl(230 14% 60% / 0.06)", glow: "hsl(235 20% 70% / 0.03)" };
    default:
      return { primary: "hsl(210 20% 88% / 0.12)", accent: "hsl(210 15% 92% / 0.06)", glow: "hsl(0 0% 100% / 0.03)" };
  }
}