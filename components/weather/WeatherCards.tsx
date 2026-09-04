import { Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { wmoToDescription } from "@/lib/open-meteo";
import { formatTemp, usePreferencesStore } from "@/store/usePreferencesStore";
import { useSpeechSynthesis } from "@/hooks/useSpeech";
import type { WeatherResponse } from "@/lib/open-meteo";

export function CurrentWeatherCard({ data, name, pending, error }: { data?: WeatherResponse; name: string; pending: boolean; error: boolean }) {
  const unit = usePreferencesStore((s) => s.unit);
  const { supported, speaking, speak, cancel } = useSpeechSynthesis();
  if (pending) return <Skeleton className="h-32 w-full max-w-md" />;
  if (error) return <Card className="max-w-md"><CardContent className="p-6">Weather data not available for this region.</CardContent></Card>;
  if (!data?.current) return null;
  const c = data.current;
  const text = `${name}: ${wmoToDescription(c.weatherCode)}, ${formatTemp(c.temperature, unit)}, wind ${Math.round(c.windSpeed)} kilometers per hour, ${c.isDay ? "day" : "night"}`;
  return (
    <Card className="max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{name} — {wmoToDescription(c.weatherCode)}</CardTitle>
        {supported && (
          <button onClick={() => (speaking ? cancel() : speak(text))} aria-label={speaking ? "Stop reading" : "Read aloud"} className={`rounded-lg p-2 border ${speaking ? "bg-amber-400 text-slate-900 border-amber-300" : "bg-white/10 text-slate-600 dark:text-slate-300 border-white/20"}`}>
            {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-4xl font-bold">{formatTemp(c.temperature, unit)}</p>
        <p className="text-sm text-muted-foreground">Wind {Number.isFinite(c.windSpeed) ? Math.round(c.windSpeed) : "--"} km/h · {c.isDay ? "Day" : "Night"}</p>
        <p className="text-xs text-muted-foreground">{c.time ? new Date(c.time).toLocaleString(undefined, { timeZone: data.timezone }) : "--"}</p>
      </CardContent>
    </Card>
  );
}

export function HourlyForecastRow({ data }: { data?: WeatherResponse }) {
  const unit = usePreferencesStore((s) => s.unit);
  if (!data?.hourly?.time) return null;
  // Show 3/6/9/12h from now (indices approximated)
  const indices = [3, 6, 9, 12];
  return (
    <div className="flex gap-2 overflow-x-auto">
      {indices.map((i) => {
        const time = data.hourly.time[i];
        const temp = data.hourly.temperature?.[i];
        const code = data.hourly.weatherCode?.[i];
        if (!time || temp == null || code == null) return null;
        return (
          <Card key={time} className="min-w-24">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{new Date(time).toLocaleTimeString(undefined, { hour: "2-digit" })}</p>
              <p className="font-semibold">{formatTemp(temp, unit)}</p>
              <p className="text-xs">{wmoToDescription(code)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
