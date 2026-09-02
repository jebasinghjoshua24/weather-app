/**
 * Regional time formatters — pure, testable, zero-deps via Intl.
 * Why Intl? Browser already knows DST; 0kB bundle.
 */

function safeTimeZone(tz: string | undefined): string {
  if (!tz) return "UTC";
  try {
    // Throws RangeError if invalid
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export function formatRegionalTime(date: Date, timeZone: string | undefined): string {
  const tz = safeTimeZone(timeZone);
  return new Intl.DateTimeFormat("en", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatRegionalDate(date: Date, timeZone: string | undefined): string {
  const tz = safeTimeZone(timeZone);
  return new Intl.DateTimeFormat("en", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRegionalOffset(date: Date, timeZone: string | undefined): string {
  const tz = safeTimeZone(timeZone);
  try {
    // Use formatToParts to derive offset via shortOffset if available, else fallback
    const fmt = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
      hour: "2-digit",
    });
    const parts = fmt.formatToParts(date);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    // tzName like "GMT+5:30" or "GMT"
    if (tzName.startsWith("GMT")) {
      const off = tzName.slice(3);
      if (!off) return "+00:00";
      // Normalize "GMT+5:30" -> "+05:30", "GMT-4" -> "-04:00"
      const sign = off[0] === "-" ? "-" : "+";
      const rest = off.slice(1);
      const [h, m] = rest.split(":");
      const hh = (h ?? "0").padStart(2, "0");
      const mm = (m ?? "00").padStart(2, "0");
      return `${sign}${hh}:${mm}`;
    }
    return tzName;
  } catch {
    return "+00:00";
  }
}

export function isValidTimeZone(tz: string | undefined): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
