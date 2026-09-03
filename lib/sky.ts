/**
 * Weather-reactive sky — foundation layer for Atmospheric Aura.
 * Why: the page background should feel like the sky at that weather + time.
 * Groups follow Open-Meteo WMO codes, mirroring lib/vibe.ts groupings.
 */

export type SkyScene = {
  top: string;
  mid: string;
  bottom: string;
  glow: string;
};

type GroupKey = "clear" | "partly" | "overcast" | "rain" | "snow" | "showers" | "storm" | "default";

const SKY_SCENES: Record<GroupKey, { day: SkyScene; night: SkyScene }> = {
  clear: {
    day: {
      top: "hsl(199 89% 68%)",
      mid: "hsl(202 85% 78%)",
      bottom: "hsl(38 92% 80% / 0.52)",
      glow: "hsl(38 92% 80% / 0.34)",
    },
    night: {
      top: "hsl(232 42% 16%)",
      mid: "hsl(240 35% 12%)",
      bottom: "hsl(245 28% 9%)",
      glow: "hsl(220 70% 65% / 0.10)",
    },
  },
  partly: {
    day: {
      top: "hsl(200 72% 72%)",
      mid: "hsl(210 55% 88%)",
      bottom: "hsl(210 25% 96% / 0.9)",
      glow: "hsl(0 0% 100% / 0.18)",
    },
    night: {
      top: "hsl(232 30% 20%)",
      mid: "hsl(240 22% 14%)",
      bottom: "hsl(240 18% 10%)",
      glow: "hsl(0 0% 100% / 0.06)",
    },
  },
  overcast: {
    day: {
      top: "hsl(210 18% 62%)",
      mid: "hsl(212 14% 78%)",
      bottom: "hsl(210 12% 92% / 0.95)",
      glow: "hsl(0 0% 100% / 0.10)",
    },
    night: {
      top: "hsl(222 18% 22%)",
      mid: "hsl(224 14% 16%)",
      bottom: "hsl(224 12% 10%)",
      glow: "hsl(0 0% 100% / 0.03)",
    },
  },
  rain: {
    day: {
      top: "hsl(215 28% 48%)",
      mid: "hsl(212 22% 62%)",
      bottom: "hsl(210 16% 88% / 0.92)",
      glow: "hsl(210 22% 80% / 0.12)",
    },
    night: {
      top: "hsl(222 35% 18%)",
      mid: "hsl(224 28% 14%)",
      bottom: "hsl(228 22% 10%)",
      glow: "hsl(210 20% 60% / 0.08)",
    },
  },
  snow: {
    day: {
      top: "hsl(200 18% 88%)",
      mid: "hsl(200 12% 94%)",
      bottom: "hsl(0 0% 100% / 0.98)",
      glow: "hsl(200 12% 92% / 0.30)",
    },
    night: {
      top: "hsl(230 22% 18%)",
      mid: "hsl(228 16% 14%)",
      bottom: "hsl(235 14% 10%)",
      glow: "hsl(200 18% 80% / 0.06)",
    },
  },
  showers: {
    day: {
      top: "hsl(212 32% 58%)",
      mid: "hsl(210 26% 72%)",
      bottom: "hsl(210 18% 92% / 0.90)",
      glow: "hsl(199 60% 85% / 0.14)",
    },
    night: {
      top: "hsl(224 28% 20%)",
      mid: "hsl(226 22% 15%)",
      bottom: "hsl(230 18% 10%)",
      glow: "hsl(199 30% 70% / 0.06)",
    },
  },
  storm: {
    day: {
      top: "hsl(232 24% 32%)",
      mid: "hsl(230 18% 42%)",
      bottom: "hsl(228 14% 58% / 0.85)",
      glow: "hsl(230 28% 50% / 0.16)",
    },
    night: {
      top: "hsl(240 38% 10%)",
      mid: "hsl(238 32% 12%)",
      bottom: "hsl(236 26% 10%)",
      glow: "hsl(230 35% 55% / 0.10)",
    },
  },
  default: {
    day: {
      top: "hsl(210 40% 96%)",
      mid: "hsl(210 30% 98%)",
      bottom: "hsl(0 0% 100%)",
      glow: "hsl(38 92% 80% / 0.12)",
    },
    night: {
      top: "hsl(222 47% 7%)",
      mid: "hsl(224 35% 10%)",
      bottom: "hsl(222 47% 7%)",
      glow: "hsl(0 0% 100% / 0.03)",
    },
  },
};

function groupForCode(code: number): GroupKey {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly";
  if (code === 3 || code === 45 || code === 48) return "overcast";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "rain";
  if ([71, 73, 75].includes(code)) return "snow";
  if ([80, 81, 82].includes(code)) return "showers";
  if ([95, 96, 99].includes(code)) return "storm";
  return "default";
}

export function getSkyScene(weatherCode: number | undefined, isDay: number | undefined): SkyScene {
  const group = typeof weatherCode === "number" ? groupForCode(weatherCode) : "default";
  const day = isDay === 0 ? "night" : "day";
  return SKY_SCENES[group][day];
}

export const SKY_DEFAULT = SKY_SCENES.default.day;
