import { useRegionalClock } from "@/hooks/useRegionalClock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RegionalClock({ timeZone, name }: { timeZone?: string; name?: string }) {
  const { time, date, offset, isValid, iso } = useRegionalClock(timeZone);

  if (!timeZone) {
    return (
      <Card className="max-w-md">
        <CardContent className="p-4 text-sm text-muted-foreground">--:--</CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{name ?? timeZone}</p>
          <time dateTime={iso} aria-live="polite" className="text-2xl font-semibold tracking-tight">
            {isValid ? time : "--:--"}
          </time>
          <p className="text-sm text-muted-foreground">{isValid ? date : "Invalid timezone"}</p>
        </div>
        <Badge aria-label={`UTC offset ${offset}`} className="bg-card text-card-foreground border">
          UTC{offset}
        </Badge>
      </CardContent>
    </Card>
  );
}
