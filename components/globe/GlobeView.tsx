"use client";

import { useEffect, useRef, useState } from "react";

export function GlobeView({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined" || !("WebGLRenderingContext" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fallback when WebGL unavailable (one-shot)
      setFailed(true);
      return;
    }
    let globe: unknown;
    let mounted = true;
    (async () => {
      try {
        const Globe = (await import("globe.gl")).default as unknown as (el: HTMLElement) => Record<string, unknown>;
        if (!mounted || !ref.current) return;
        const g = (Globe as unknown as (el: HTMLElement) => Record<string, unknown>)(ref.current) as unknown as {
          globeImageUrl: (s: string) => typeof g;
          pointsData: (d: unknown[]) => typeof g;
          pointLat: (s: string) => typeof g;
          pointLng: (s: string) => typeof g;
          pointAltitude: (n: number) => typeof g;
          pointColor: (s: string) => typeof g;
          controls: () => { autoRotate: boolean; enableZoom: boolean };
        };
        g.globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
          .pointsData([{ lat, lng: lon, name }])
          .pointLat("lat")
          .pointLng("lng")
          .pointAltitude(0.02)
          .pointColor("rgba(251,191,36,0.9)");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g as any).controls().autoRotate = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g as any).controls().enableZoom = true;
        globe = g;
      } catch {
        if (mounted) setFailed(true);
      }
    })();
    return () => {
      mounted = false;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globe as any)?.controls?.()?.dispose?.();
      } catch {}
    };
  }, [lat, lon, name]);

  if (failed) return <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 text-sm text-slate-400">Globe unavailable (no WebGL)</div>;

  return <div ref={ref} className="h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black" />;
}
