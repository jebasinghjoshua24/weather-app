/**
 * Weather-reactive sky — foundation layer for Atmospheric Aura.
 * Alive but premium: zinc-slate base + single electric blue accent (221) locked.
 * Every group is distinct enough to read as weather, but stays in one family.
 * Reference: Apple Weather — clear is vivid blue, rain is slate, storm is ink.
 */

export type SkyScene = {
  top: string;
  mid: string;
  bottom: string;
  glow: string;
};

export type GroupKey = "clear" | "partly" | "overcast" | "rain" | "snow" | "showers" | "storm" | "default";

const SKY_SCENES: Record<GroupKey, { day: SkyScene; night: SkyScene }> = {
  clear: {
    day: {
      top: "hsl(205 78% 58%)",
      mid: "hsl(202 74% 72%)",
      bottom: "hsl(38 92% 88%)",
      glow: "hsl(38 92% 78% / 0.38)",
    },
    night: {
      top: "hsl(235 38% 14%)",
      mid: "hsl(240 32% 10%)",
      bottom: "hsl(245 28% 7%)",
      glow: "hsl(220 70% 62% / 0.14)",
    },
  },
  partly: {
    day: {
      top: "hsl(205 52% 72%)",
      mid: "hsl(210 40% 92%)",
      bottom: "hsl(0 0% 100%)",
      glow: "hsl(0 0% 100% / 0.22)",
    },
    night: {
      top: "hsl(232 24% 18%)",
      mid: "hsl(238 20% 12%)",
      bottom: "hsl(240 22% 7%)",
      glow: "hsl(0 0% 100% / 0.06)",
    },
  },
  overcast: {
    day: {
      top: "hsl(220 14% 72%)",
      mid: "hsl(212 16% 84%)",
      bottom: "hsl(210 10% 96%)",
      glow: "hsl(0 0% 100% / 0.14)",
    },
    night: {
      top: "hsl(240 8% 18%)",
      mid: "hsl(240 6% 12%)",
      bottom: "hsl(240 10% 6%)",
      glow: "hsl(240 6% 50% / 0.07)",
    },
  },
  rain: {
    day: {
      top: "hsl(215 26% 52%)",
      mid: "hsl(212 22% 68%)",
      bottom: "hsl(210 16% 90%)",
      glow: "hsl(215 22% 72% / 0.18)",
    },
    night: {
      top: "hsl(222 28% 16%)",
      mid: "hsl(224 22% 11%)",
      bottom: "hsl(230 20% 7%)",
      glow: "hsl(215 22% 62% / 0.10)",
    },
  },
  snow: {
    day: {
      top: "hsl(200 22% 88%)",
      mid: "hsl(200 14% 96%)",
      bottom: "hsl(0 0% 100%)",
      glow: "hsl(200 18% 90% / 0.22)",
    },
    night: {
      top: "hsl(228 18% 16%)",
      mid: "hsl(230 14% 11%)",
      bottom: "hsl(240 14% 7%)",
      glow: "hsl(200 16% 82% / 0.08)",
    },
  },
  showers: {
    day: {
      top: "hsl(212 24% 62%)",
      mid: "hsl(210 20% 80%)",
      bottom: "hsl(210 14% 96%)",
      glow: "hsl(200 55% 80% / 0.16)",
    },
    night: {
      top: "hsl(224 18% 16%)",
      mid: "hsl(226 14% 11%)",
      bottom: "hsl(230 16% 7%)",
      glow: "hsl(200 22% 68% / 0.08)",
    },
  },
  storm: {
    day: {
      top: "hsl(232 18% 32%)",
      mid: "hsl(230 14% 48%)",
      bottom: "hsl(228 10% 72%)",
      glow: "hsl(235 32% 58% / 0.16)",
    },
    night: {
      top: "hsl(240 32% 8%)",
      mid: "hsl(238 28% 10%)",
      bottom: "hsl(236 22% 7%)",
      glow: "hsl(235 32% 55% / 0.14)",
    },
  },
  default: {
    day: {
      top: "hsl(210 30% 92%)",
      mid: "hsl(210 20% 96%)",
      bottom: "hsl(0 0% 98%)",
      glow: "hsl(221 83% 53% / 0.07)",
    },
    night: {
      top: "hsl(240 10% 7%)",
      mid: "hsl(240 8% 10%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(221 83% 53% / 0.05)",
    },
  },
};

export function groupForCode(code: number): GroupKey {
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
