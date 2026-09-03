"use client";

import { useEffect, useRef } from "react";
import { getSkyScene } from "@/lib/sky";
import { getAuraPalette } from "@/lib/aura";

interface Particle {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  o: number;
  phase: number;
}

/**
 * Atmospheric Aura — floating light particles like dust motes.
 * Colors derive from the weather sky scene (lib/aura.ts).
 * Canvas at z-[1] (above WeatherBackground z-0, below content z-10).
 * Reduced motion → single static frame. Visibility hidden → pause rAF.
 */
export function AtmosphericAura({
  weatherCode,
  isDay,
}: {
  weatherCode?: number;
  isDay?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = 32;

  useEffect(() => {
    if (weatherCode == null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = getSkyScene(weatherCode, isDay);
    const pal = getAuraPalette(scene, weatherCode);

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    let t = 0;

    const ps: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 90 + 40,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ps.forEach((p) => {
        p.x += p.dx * 0.3;
        p.y += p.dy * 0.3;
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;
        const op = p.o * (0.6 + 0.4 * Math.sin(t * 0.001 + p.phase));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, pal.primary);
        g.addColorStop(0.4, pal.accent);
        g.addColorStop(0.8, pal.glow);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = op;
        ctx.fillStyle = g;
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      });
      t++;
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (!document.hidden && !reduce) loop();
      else cancelAnimationFrame(raf);
    };
    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    if (reduce) {
      draw();
    } else {
      loop();
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [weatherCode, isDay]);

  if (weatherCode == null) return null;

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[1]" />;
}