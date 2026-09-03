"use client";

import { useEffect, useRef, useState } from "react";
import { getSkyScene, type SkyScene } from "@/lib/sky";

function sceneBackground(s: SkyScene): string {
  return [
    `radial-gradient(900px 700px at 50% 0%, ${s.glow}, transparent 68%)`,
    `radial-gradient(1200px 800px at 18% -8%, ${s.top} 0%, transparent 62%)`,
    `radial-gradient(900px 700px at 92% 4%, ${s.mid} 0%, transparent 60%)`,
    `linear-gradient(180deg, ${s.top} 0%, ${s.mid} 42%, ${s.bottom} 100%)`,
  ].join(", ");
}

export function WeatherBackground({
  weatherCode,
  isDay,
}: {
  weatherCode?: number;
  isDay?: number;
}) {
  const scene = getSkyScene(weatherCode, isDay);
  const [prev, setPrev] = useState<SkyScene | null>(null);
  const [current, setCurrent] = useState<SkyScene>(scene);
  const currentKey = `${weatherCode ?? "default"}-${isDay ?? 1}`;
  const prevKeyRef = useRef(currentKey);

  useEffect(() => {
    if (currentKey === prevKeyRef.current) return;
    setPrev(current);
    // kick crossfade to new scene on next frame
    const id = requestAnimationFrame(() => setCurrent(scene));
    prevKeyRef.current = currentKey;
    const timeout = setTimeout(() => setPrev(null), 1400);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(timeout);
    };
  }, [currentKey, scene, current]);

  // No location yet → show neutral fallback (body mesh) — render nothing decorative
  if (weatherCode == null) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* previous scene layer (fades out) */}
      {prev && (
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{ background: sceneBackground(prev), opacity: 1 }}
          // will fade to 0 via key change + timeout cleanup
        />
      )}
      {/* current scene layer */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{ background: sceneBackground(current) }}
      />
      {/* subtle drifting cloud orbs — decorative, hidden from a11y, disabled under reduced-motion */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="sky-orb sky-orb--a" style={{ background: `radial-gradient(600px 400px at 50% 50%, hsl(0 0% 100% / 0.16), transparent 70%)` }} />
        <div className="sky-orb sky-orb--b" style={{ background: `radial-gradient(500px 350px at 50% 50%, hsl(0 0% 100% / 0.12), transparent 70%)` }} />
        <div className="sky-orb sky-orb--c" style={{ background: `radial-gradient(700px 450px at 50% 50%, hsl(0 0% 100% / 0.10), transparent 70%)` }} />
      </div>
    </div>
  );
}
