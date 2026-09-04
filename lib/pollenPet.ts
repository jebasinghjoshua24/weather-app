/** Pollen & Pet — AQI + pollen + pavement (derived). */

export function aqiLevel(aqi: number | null | undefined): { label: string; color: string } {
  if (aqi == null || !Number.isFinite(aqi)) return { label: "Unknown", color: "text-slate-400" };
  if (aqi <= 50) return { label: "Good", color: "text-emerald-400" };
  if (aqi <= 100) return { label: "Moderate", color: "text-amber-400" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "text-orange-400" };
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-400" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-rose-500" };
  return { label: "Hazardous", color: "text-rose-700" };
}

export function pollenLevel(maxPollen: number | null | undefined): string {
  if (maxPollen == null || !Number.isFinite(maxPollen)) return "Low";
  if (maxPollen < 1) return "Low";
  if (maxPollen < 3) return "Moderate";
  if (maxPollen < 5) return "High";
  return "Very High";
}

export function pavementTemp(airTemp: number | null | undefined, isDay: number | null | undefined): number | null {
  if (airTemp == null || !Number.isFinite(airTemp)) return null;
  const offset = isDay === 1 ? 12 : isDay === 0 ? -2 : 6;
  return airTemp + offset;
}

export function pawStatus(pavement: number | null): string {
  if (pavement == null) return "--";
  if (pavement < 30) return "Safe";
  if (pavement <= 45) return "Caution";
  return "Burning — carry your pet";
}
