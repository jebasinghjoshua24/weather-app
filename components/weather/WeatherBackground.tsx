"use client";

import { useEffect, useRef, useState } from "react";
import { getSkyScene, groupForCode, type SkyScene } from "@/lib/sky";

function sceneBackground(s: SkyScene): string {
  return [
    `radial-gradient(900px 700px at 50% 0%, ${s.glow}, transparent 68%)`,
    `radial-gradient(1200px 800px at 18% -8%, ${s.top} 0%, transparent 62%)`,
    `radial-gradient(900px 700px at 92% 4%, ${s.mid} 0%, transparent 60%)`,
    `linear-gradient(180deg, ${s.top} 0%, ${s.mid} 42%, ${s.bottom} 100%)`,
  ].join(", ");
}

function WeatherExtras({ code, isDay }: { code?: number; isDay?: number }) {
  const group = code != null ? groupForCode(code) : "default";
  const night = isDay === 0;

  // Clear day → soft sun pulse
  if (group === "clear" && !night) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-10 right-[12%] h-[420px] w-[420px] rounded-full blur-[1px]"
          style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsl(38 92% 80% / 0.55) 0%, hsl(38 92% 78% / 0.18) 42%, transparent 72%)",
            animation: "sunPulse 9s cubic-bezier(0.32,0.72,0,1) infinite alternate",
          }}
        />
      </div>
    );
  }

  // Rain / showers → diagonal streaks
  if (group === "rain" || group === "showers") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(108deg, transparent 0 22px, hsl(210 14% 55% / 0.9) 22px 23px)",
          backgroundSize: "80px 80px",
          animation: "rainDrift 1.8s linear infinite",
        }}
      />
    );
  }

  // Snow → falling flakes (pure CSS dots)
  if (group === "snow") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="snow-layer snow-layer--a" />
        <div className="snow-layer snow-layer--b" />
      </div>
    );
  }

  // Storm → occasional lightning flash
  if (group === "storm") {
    return <div aria-hidden className="absolute inset-0 bg-white/0 animate-[lightning_11s_ease-in-out_infinite]" />;
  }

  // Overcast → heavier, slower cloud bank
  if (group === "overcast") {
    return (
      <div className="absolute inset-0 overflow-hidden opacity-[0.16]">
        <div className="sky-orb sky-orb--overcast" style={{ background: "radial-gradient(900px 500px at 50% 50%, hsl(0 0% 100% / 0.22), transparent 72%)" }} />
      </div>
    );
  }

  return null;
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
    const id = requestAnimationFrame(() => setCurrent(scene));
    prevKeyRef.current = currentKey;
    const timeout = setTimeout(() => setPrev(null), 1400);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(timeout);
    };
  }, [currentKey, scene, current]);

  if (weatherCode == null) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {prev && (
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{ background: sceneBackground(prev) }}
        />
      )}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{ background: sceneBackground(current) }}
      />
      {/* drifting cloud orbs — alive but premium (faster than before) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="sky-orb sky-orb--a" style={{ background: `radial-gradient(600px 400px at 50% 50%, hsl(0 0% 100% / 0.22), transparent 70%)` }} />
        <div className="sky-orb sky-orb--b" style={{ background: `radial-gradient(500px 350px at 50% 50%, hsl(0 0% 100% / 0.16), transparent 70%)` }} />
        <div className="sky-orb sky-orb--c" style={{ background: `radial-gradient(700px 450px at 50% 50%, hsl(0 0% 100% / 0.13), transparent 70%)` }} />
      </div>
      <WeatherExtras code={weatherCode} isDay={isDay} />
    </div>
  );
}
