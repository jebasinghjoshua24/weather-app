import { useWeatherVibe } from "@/hooks/useWeatherVibe";

export function WeatherVibe({ weatherCode, isDay }: { weatherCode?: number; isDay?: number }) {
  const vibe = useWeatherVibe(weatherCode, isDay);
  return (
    <p className="mx-auto max-w-[42rem] text-center font-[var(--font-slab)] text-[15px] italic leading-relaxed tracking-[-0.01em] text-slate-200/90" aria-live="polite">
      <span className="text-amber-300/60 mr-2">—</span>“{vibe}”<span className="text-amber-300/60 ml-2">—</span>
    </p>
  );
}
