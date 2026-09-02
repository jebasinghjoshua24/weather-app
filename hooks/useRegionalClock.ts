"use client";

import { useEffect, useState } from "react";
import {
  formatRegionalTime,
  formatRegionalDate,
  formatRegionalOffset,
  isValidTimeZone,
} from "@/lib/time";

/**
 * Live regional clock — ticks every second, pauses when tab hidden.
 * Why visibility pause? Saves battery/CPU when user isn't looking.
 */
export function useRegionalClock(timeZone: string | undefined) {
  const [now, setNow] = useState(() => new Date());
  const valid = isValidTimeZone(timeZone);
  const tz = valid ? timeZone : "UTC";

  useEffect(() => {
    const tick = () => setNow(new Date());
    let id: ReturnType<typeof setInterval> | null = setInterval(tick, 1000);

    const onVisibility = () => {
      if (document.hidden) {
        if (id) clearInterval(id);
        id = null;
      } else {
        tick();
        if (!id) id = setInterval(tick, 1000);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [timeZone]);

  const time = formatRegionalTime(now, tz);
  const date = formatRegionalDate(now, tz);
  const offset = formatRegionalOffset(now, tz);

  return { time, date, offset, isValid: valid, iso: now.toISOString() };
}
