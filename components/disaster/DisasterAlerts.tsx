import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEonet } from "@/hooks/useEonet";
import { EONET_CATEGORIES, type EonetEvent } from "@/lib/eonet";

function CategoryFilter({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        aria-label="All categories"
        onClick={() => onChange(undefined)}
        className={`cursor-pointer ${!value ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border"}`}
      >
        All
      </Badge>
      {EONET_CATEGORIES.map((c) => (
        <Badge
          key={c}
          onClick={() => onChange(c)}
          className={`cursor-pointer capitalize ${value === c ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground border"}`}
        >
          {c}
        </Badge>
      ))}
    </div>
  );
}

function AlertCard({ ev, onFlyTo }: { ev: EonetEvent; onFlyTo?: (ev: EonetEvent) => void }) {
  const cat = ev.categories[0]?.title ?? "Event";
  const mag = ev.geometry[0]?.magnitudeValue;
  const unit = ev.geometry[0]?.magnitudeUnit;
  return (
    <div className="rounded-lg border p-3 hover:bg-muted/50">
      <div className="flex items-center gap-2">
        <Badge>{cat}</Badge>
        {mag != null && unit && (
          <span className="text-xs text-muted-foreground">
            {mag} {unit}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">{ev.title}</p>
      {ev.description && <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>}
      <div className="mt-2 flex gap-2">
        {ev.sources[0]?.url && (
          <a href={ev.sources[0].url} target="_blank" rel="noopener noreferrer" className="text-xs underline">
            Source
          </a>
        )}
        {onFlyTo && (
          <button onClick={() => onFlyTo(ev)} className="text-xs underline">
            View on map
          </button>
        )}
      </div>
    </div>
  );
}

export function DisasterAlerts({
  location,
  onFlyTo,
}: {
  location: { lat: number; lon: number } | null;
  onFlyTo?: (ev: EonetEvent) => void;
}) {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data, isPending, isError, bannerEvent } = useEonet(location, category);

  if (isPending) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Disaster Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Disaster Alerts</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Disasters unavailable right now.</CardContent>
      </Card>
    );
  }

  const events = data?.events ?? [];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-base">Disaster Alerts</CardTitle>
        <CategoryFilter value={category} onChange={setCategory} />
        {bannerEvent && (
          <div role="status" className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
            ⚠️ Severe nearby: {bannerEvent.title}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No disasters near you.</p>
        ) : (
          events.map((ev) => <AlertCard key={ev.id} ev={ev} onFlyTo={onFlyTo} />)
        )}
      </CardContent>
    </Card>
  );
}
