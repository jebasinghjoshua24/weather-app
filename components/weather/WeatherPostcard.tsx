"use client";

import { useRef } from "react";
import { getSkyScene } from "@/lib/sky";
import { wmoToDescription } from "@/lib/open-meteo";
import type { WeatherResponse } from "@/lib/open-meteo";

export function WeatherPostcard({ data, name }: { data?: WeatherResponse | null; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const download = () => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scene = getSkyScene(data.current.weatherCode, data.current.isDay);
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, scene.top);
    grad.addColorStop(0.5, scene.mid);
    grad.addColorStop(1, scene.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);
    // Card
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(32, 32, 736, 436, 24);
    ctx.fill();
    // Text
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 44px var(--font-slab, sans-serif)";
    ctx.fillText(name, 64, 110);
    ctx.font = "600 18px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(wmoToDescription(data.current.weatherCode), 64, 140);
    ctx.fillStyle = "#0f172a";
    ctx.font = "800 72px sans-serif";
    ctx.fillText(`${Math.round(data.current.temperature)}°`, 64, 230);
    ctx.font = "400 14px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText(new Date(data.current.time).toLocaleString(undefined, { timeZone: data.timezone }), 64, 260);
    ctx.font = "italic 16px serif";
    ctx.fillStyle = "#334155";
    ctx.fillText(`ATMOSPHERE • ${data.timezone}`, 64, 440);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `atmos-${name}.png`;
    a.click();
  };

  if (!data) return null;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">Postcard</h3>
      <canvas ref={canvasRef} width={800} height={500} className="hidden" aria-hidden />
      <button onClick={download} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100">
        Download PNG
      </button>
    </div>
  );
}
