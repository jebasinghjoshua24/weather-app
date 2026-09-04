import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeatherNews } from "@/hooks/useWeatherNews";

export function NewsFeed({ country }: { country?: string | null }) {
  const { data, isPending, isError } = useWeatherNews(country);

  if (isPending) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Weather News</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Weather News</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">News unavailable right now.</CardContent>
      </Card>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Weather News</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">No weather news right now.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Weather News</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <a
            key={it.link}
            href={it.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded p-2 hover:bg-muted"
          >
            <p className="text-sm font-medium leading-tight">{it.title}</p>
            {it.pubDate && <p className="text-xs text-muted-foreground">{new Date(it.pubDate).toLocaleDateString()}</p>}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
