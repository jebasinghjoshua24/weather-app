/** Stargazing score 0–100 — cloud + moon + day/night, no API. */

export function moonIllumination(date: Date): number {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((days % 29.53) + 29.53) % 29.53 / 29.53;
  // 0 = new, 0.5 = full
  return (1 - Math.cos(2 * Math.PI * phase)) / 2;
}

export function stargazingScore(opts: {
  cloudCover?: number | null;
  isDay?: number | null;
  date?: Date;
}): number {
  const { cloudCover, isDay, date = new Date() } = opts;
  if (isDay === 1) return 0; // day: no stars
  const cloud = typeof cloudCover === "number" && Number.isFinite(cloudCover) ? cloudCover : 50;
  const illum = moonIllumination(date);
  const raw = 100 - cloud * 0.9 - illum * 35;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function stargazingLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 35) return "Fair";
  return "Poor";
}
