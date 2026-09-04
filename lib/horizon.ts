/**
 * Horizon physics — sun elevation → gradient palette (Rayleigh + Mie lite).
 * No API, pure math (NOAA solar position).
 */

export interface HorizonPalette {
  top: string;
  mid: string;
  horizon: string;
  glow: string;
}

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** Solar elevation in degrees (-90 to 90). Timezone-aware via Intl. */
export function solarElevation(
  lat: number,
  lon: number,
  date: Date,
  timeZone?: string
): { elevation: number; azimuth: number } {
  const n = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const decl = 23.45 * Math.sin(toRad((360 * (284 + n)) / 365));
  // Local solar time: use timezone if available, else UTC+lon
  let localHours: number;
  if (timeZone) {
    try {
      const fmt = new Intl.DateTimeFormat("en", {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = fmt.formatToParts(date);
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
      const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      localHours = h + m / 60;
    } catch {
      const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
      localHours = utcHours + lon / 15;
    }
  } else {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    localHours = utcHours + lon / 15;
  }
  const hourAngle = 15 * (localHours - 12);
  const latRad = toRad(lat);
  const declRad = toRad(decl);
  const haRad = toRad(hourAngle);
  const elevRad = Math.asin(Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad));
  const elevation = toDeg(elevRad);
  const azRad = Math.acos(
    (Math.sin(declRad) - Math.sin(elevRad) * Math.sin(latRad)) / (Math.cos(elevRad) * Math.cos(latRad) || 1)
  );
  const azimuth = localHours < 12 ? 360 - toDeg(azRad) : toDeg(azRad);
  return { elevation, azimuth };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Map elevation + cloud + day to horizon palette (HSL strings). */
export function horizonPalette(
  elevation: number,
  cloudCover: number | undefined,
  isDay: number | undefined
): HorizonPalette {
  const night = isDay === 0 || elevation < -6;
  const t = clamp((elevation + 10) / 80, 0, 1); //  -10 → 0, 70 → 1
  const cloud = clamp((cloudCover ?? 0) / 100, 0, 1);

  if (night) {
    return {
      top: "hsl(240 28% 12%)",
      mid: "hsl(240 18% 18%)",
      horizon: `hsl(240 10% ${lerp(14, 18, t).toFixed(0)}%)`,
      glow: "hsl(240 20% 45% / 0.08)",
    };
  }

  // Day: Rayleigh blue zenith + Mie amber horizon
  const topL = lerp(28, 58, t);
  const topS = lerp(32, 78, t);
  const horH = lerp(38, 210, t * 0.7);
  const horS = lerp(92, 40, t) * (1 - cloud * 0.4);
  const horL = lerp(72, 88, t) * (1 - cloud * 0.08);

  return {
    top: `hsl(${205} ${topS.toFixed(0)}% ${topL.toFixed(0)}%)`,
    mid: `hsl(${210} ${lerp(40, 26, t).toFixed(0)}% ${lerp(72, 92, t).toFixed(0)}%)`,
    horizon: `hsl(${horH.toFixed(0)} ${horS.toFixed(0)}% ${horL.toFixed(0)}%)`,
    glow: `hsl(38 92% 72% / ${(0.28 * (1 - t * 0.6)).toFixed(2)})`,
  };
}
