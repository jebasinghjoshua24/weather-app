/**
 * Weather-reactive sky — foundation layer for Atmospheric Aura.
 * Cold luxury palette locked: zinc-slate base + single electric blue accent (221 83%).
 * No purple/ brass/ warm beige per taste + high-end bans.
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
      top: "hsl(221 83% 92%)",
      mid: "hsl(210 40% 96%)",
      bottom: "hsl(0 0% 100%)",
      glow: "hsl(221 83% 53% / 0.07)",
    },
    night: {
      top: "hsl(240 10% 7%)",
      mid: "hsl(240 8% 10%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(221 83% 53% / 0.06)",
    },
  },
  partly: {
    day: {
      top: "hsl(210 30% 94%)",
      mid: "hsl(0 0% 100%)",
      bottom: "hsl(240 5% 98%)",
      glow: "hsl(221 20% 80% / 0.10)",
    },
    night: {
      top: "hsl(240 10% 9%)",
      mid: "hsl(240 8% 12%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(0 0% 100% / 0.04)",
    },
  },
  overcast: {
    day: {
      top: "hsl(240 6% 88%)",
      mid: "hsl(240 5% 94%)",
      bottom: "hsl(0 0% 100%)",
      glow: "hsl(240 4% 90% / 0.12)",
    },
    night: {
      top: "hsl(240 6% 14%)",
      mid: "hsl(240 4% 10%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(240 4% 50% / 0.06)",
    },
  },
  rain: {
    day: {
      top: "hsl(220 14% 82%)",
      mid: "hsl(210 12% 92%)",
      bottom: "hsl(0 0% 98%)",
      glow: "hsl(221 30% 70% / 0.08)",
    },
    night: {
      top: "hsl(240 10% 12%)",
      mid: "hsl(240 8% 9%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(221 30% 60% / 0.06)",
    },
  },
  snow: {
    day: {
      top: "hsl(200 12% 94%)",
      mid: "hsl(0 0% 100%)",
      bottom: "hsl(200 10% 98%)",
      glow: "hsl(200 10% 90% / 0.12)",
    },
    night: {
      top: "hsl(230 12% 14%)",
      mid: "hsl(230 10% 10%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(200 12% 85% / 0.05)",
    },
  },
  showers: {
    day: {
      top: "hsl(215 16% 86%)",
      mid: "hsl(210 12% 94%)",
      bottom: "hsl(0 0% 98%)",
      glow: "hsl(221 22% 78% / 0.08)",
    },
    night: {
      top: "hsl(240 10% 13%)",
      mid: "hsl(240 8% 9%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(221 20% 65% / 0.05)",
    },
  },
  storm: {
    day: {
      top: "hsl(240 10% 78%)",
      mid: "hsl(240 6% 88%)",
      bottom: "hsl(0 0% 96%)",
      glow: "hsl(240 12% 60% / 0.10)",
    },
    night: {
      top: "hsl(240 18% 10%)",
      mid: "hsl(240 14% 7%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(240 20% 45% / 0.08)",
    },
  },
  default: {
    day: {
      top: "hsl(240 5% 96%)",
      mid: "hsl(0 0% 100%)",
      bottom: "hsl(0 0% 98%)",
      glow: "hsl(221 83% 53% / 0.05)",
    },
    night: {
      top: "hsl(240 10% 4%)",
      mid: "hsl(240 8% 7%)",
      bottom: "hsl(240 10% 4%)",
      glow: "hsl(221 83% 53% / 0.04)",
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
