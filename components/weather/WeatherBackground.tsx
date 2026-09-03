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

  // Clear day → soft sun pulse (now much more visible)
  if (group === "clear" && !night) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-12 right-[10%] h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsl(38 96% 72% / 0.85) 0%, hsl(38 92% 78% / 0.38) 38%, hsl(38 92% 80% / 0.14) 58%, transparent 74%)",
            filter: "blur(8px)",
            animation: "sunPulse 7s cubic-bezier(0.32,0.72,0,1) infinite alternate",
          }}
        />
        <div
          className="absolute -top-6 right-[18%] h-[260px] w-[260px] rounded-full"
          style={{
            background: "radial-gradient(50% 50% at 50% 50%, hsl(0 0% 100% / 0.95) 0%, hsl(38 100% 92% / 0.0) 70%)",
            filter: "blur(0.5px)",
          }}
        />
      </div>
    );
  }
  if (group === "clear" && night) {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(1.2px 1.2px at 22% 18%, hsl(0 0% 100% / 0.95) 50%, transparent 52%), radial-gradient(1px 1px at 58% 42%, hsl(0 0% 100% / 0.7) 50%, transparent 52%), radial-gradient(1.4px 1.4px at 78% 22%, hsl(0 0% 100% / 0.85) 50%, transparent 52%), radial-gradient(1px 1px at 44% 78%, hsl(0 0% 100% / 0.6) 50%, transparent 52%)", backgroundSize: "420px 320px" }} />
      </div>
    );
  }

  // Rain / showers → diagonal streaks (now thick and obvious)
  if (group === "rain" || group === "showers") {
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.42] dark:opacity-[0.32]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(108deg, transparent 0 16px, hsl(210 32% 28% / 0.95) 16px 18.5px)",
            backgroundSize: "90px 90px",
            animation: "rainDrift 0.65s linear infinite",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(108deg, transparent 0 28px, hsl(210 18% 82% / 0.9) 28px 29px)",
            backgroundSize: "120px 120px",
            animation: "rainDrift 0.9s linear infinite reverse",
          }}
        />
      </>
    );
  }

  // Snow → falling flakes (much larger + faster)
  if (group === "snow") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="snow-layer snow-layer--a" />
        <div className="snow-layer snow-layer--b" />
        <div className="snow-layer snow-layer--c" />
      </div>
    );
  }

  // Storm → lightning flash (more frequent) + heavy streaks
  if (group === "storm") {
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.32] dark:opacity-[0.26]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(108deg, transparent 0 18px, hsl(230 18% 22% / 0.9) 18px 20px)",
            backgroundSize: "100px 100px",
            animation: "rainDrift 0.55s linear infinite",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-white/0 animate-[lightning_7s_ease-in-out_infinite]" />
      </>
    );
  }

  // Overcast → heavier, slower cloud bank (much more visible)
  if (group === "overcast") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[8%] left-[-8%] h-[760px] w-[1100px] rounded-full blur-[18px] opacity-[0.32] dark:opacity-[0.18]" style={{ background: "radial-gradient(70% 60% at 50% 50%, hsl(0 0% 100% / 0.95) 0%, hsl(0 0% 100% / 0.42) 38%, transparent 72%)" }} />
        <div className="absolute top-[18%] right-[-6%] h-[520px] w-[780px] rounded-full blur-[14px] opacity-[0.22] dark:opacity-[0.12]" style={{ background: "radial-gradient(70% 60% at 50% 50%, hsl(0 0% 100% / 0.88) 0%, transparent 72%)" }} />
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
