import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { wmoToDescription } from "@/lib/open-meteo";
import { usePreferencesStore, toDisplayTemp, tempLabel } from "@/store/usePreferencesStore";
import type { WeatherResponse } from "@/lib/open-meteo";

export function CurrentWeatherCard({ data, name, pending, error }: { data?: WeatherResponse; name: string; pending: boolean; error: boolean }) {
  const unit = usePreferencesStore((s) => s.unit);
  if (pending) return <Skeleton className="h-32 w-full max-w-md" />;
  if (error) return <Card className="max-w-md"><CardContent className="p-6">Weather data not available for this region.</CardContent></Card>;
  if (!data) return null;
  const c = data.current;
  return (
    <Card className="max-w-md">
      <CardHeader><CardTitle>{name} — {wmoToDescription(c.weatherCode)}</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        <p className="text-4xl font-bold">{Math.round(toDisplayTemp(c.temperature, unit))}{tempLabel(unit)}</p>
        <p className="text-sm text-muted-foreground">Wind {Math.round(c.windSpeed)} km/h · {c.isDay ? "Day" : "Night"}</p>
        <p className="text-xs text-muted-foreground">{new Date(c.time).toLocaleString(undefined, { timeZone: data.timezone })}</p>
      </CardContent>
    </Card>
  );
}

export function HourlyForecastRow({ data }: { data?: WeatherResponse }) {
  const unit = usePreferencesStore((s) => s.unit);
  if (!data) return null;
  // Show 3/6/9/12h from now (indices approximated)
  const indices = [3, 6, 9, 12];
  return (
    <div className="flex gap-2 overflow-x-auto">
      {indices.map((i) => {
        const time = data.hourly.time[i];
        if (!time) return null;
        return (
          <Card key={time} className="min-w-24">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{new Date(time).toLocaleTimeString(undefined, { hour: "2-digit" })}</p>
              <p className="font-semibold">{Math.round(toDisplayTemp(data.hourly.temperature[i], unit))}{tempLabel(unit)}</p>
              <p className="text-xs">{wmoToDescription(data.hourly.weatherCode[i])}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
