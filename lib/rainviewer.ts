/** RainViewer — host + past frames. */

export interface RainViewerFrame {
  time: number; // unix seconds
  path: string;
}

export interface RainViewerData {
  host: string;
  frames: RainViewerFrame[];
}

export async function fetchRainViewer(): Promise<RainViewerData> {
  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
  if (!res.ok) throw new Error("RainViewer unavailable");
  const json = (await res.json()) as {
    host: string;
    radar?: { past?: Array<{ time: number; path: string }> };
  };
  const past = json.radar?.past ?? [];
  const frames = past.slice(-8).map((p) => ({ time: p.time, path: p.path }));
  return { host: json.host, frames };
}
