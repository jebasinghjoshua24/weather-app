import { useWeatherVibe } from "@/hooks/useWeatherVibe";

export function WeatherVibe({ weatherCode, isDay }: { weatherCode?: number; isDay?: number }) {
  const vibe = useWeatherVibe(weatherCode, isDay);
  return (
    <p className="text-center text-lg italic text-muted-foreground" aria-live="polite">
      “{vibe}”
    </p>
  );
}
