/** Predictive forecast helpers — tested, pure. */

export function forecastIndices(): number[] {
  return [3, 6, 9, 12];
}

export function nextHoursLabel(isoTime: string): string {
  const d = new Date(isoTime);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleTimeString(undefined, { hour: "2-digit" });
}
