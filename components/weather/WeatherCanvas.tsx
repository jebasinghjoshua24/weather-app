"use client";

import { useEffect, useRef } from "react";

type ConditionKey =
  | "clear_day"
  | "clear_night"
  | "partly_cloudy_day"
  | "partly_cloudy_night"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "thunderstorm";

export function getConditionKey(code: number | undefined, isDay: number | undefined): ConditionKey {
  if (code === 0) return isDay === 0 ? "clear_night" : "clear_day";
  if (code === 1 || code === 2) return isDay === 0 ? "partly_cloudy_night" : "partly_cloudy_day";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return "snow";
  if ([95, 96, 99].includes(code ?? -1)) return "thunderstorm";
  return isDay === 0 ? "clear_night" : "clear_day";
}

export function WeatherCanvas({ conditionKey }: { conditionKey: ConditionKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = true;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const count =
      conditionKey.includes("rain") ? 220 : conditionKey === "thunderstorm" ? 350 : conditionKey === "snow" ? 120 : conditionKey === "fog" ? 40 : conditionKey === "clear_night" ? 90 : 35;

    type P = { x: number; y: number; r: number; sx: number; sy: number; len: number; o: number; tw: number; a: number };
    const ps: P[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 3 + 1,
      sx: (Math.random() - 0.5) * 1.5,
      sy:
        conditionKey.includes("rain") || conditionKey === "thunderstorm"
          ? Math.random() * 12 + 10
          : conditionKey === "snow"
            ? Math.random() * 1.5 + 0.8
            : Math.random() * 0.5 - 0.25,
      len: Math.random() * 20 + 10,
      o: Math.random() * 0.7 + 0.3,
      tw: Math.random() * 0.03 + 0.005,
      a: Math.random() * Math.PI * 2,
    }));

    let lt = 0;
    let flash = false;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!running) return;
      if (conditionKey === "thunderstorm") {
        lt++;
        if (lt > 180 && Math.random() < 0.03) {
          flash = true;
          lt = 0;
          setTimeout(() => (flash = false), 80);
        }
        if (flash) {
          ctx.fillStyle = "rgba(240,243,255,0.35)";
          ctx.fillRect(0, 0, w, h);
        }
      }
      ps.forEach((p) => {
        ctx.beginPath();
        if (conditionKey.includes("rain") || conditionKey === "thunderstorm") {
          ctx.strokeStyle = `rgba(190,220,255,${p.o * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.sx * 2, p.y + p.len);
          ctx.stroke();
          p.y += p.sy;
          p.x += (Math.random() - 0.5) * 0.5;
          if (p.y > h) {
            p.y = -20;
            p.x = Math.random() * w;
          }
        } else if (conditionKey === "snow") {
          p.a += 0.02;
          p.x += Math.sin(p.a) * 0.8;
          p.y += p.sy;
          ctx.fillStyle = `rgba(255,255,255,${p.o})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          if (p.y > h) {
            p.y = -10;
            p.x = Math.random() * w;
          }
        } else if (conditionKey === "clear_night" || conditionKey === "partly_cloudy_night") {
          p.o += Math.sin(Date.now() * p.tw) * 0.015;
          ctx.fillStyle = `rgba(255,255,255,${Math.max(0.1, Math.min(0.9, p.o))})`;
          ctx.arc(p.x, p.y, p.r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (conditionKey === "fog") {
          p.x += p.sx * 0.5;
          if (p.x > w + 100) p.x = -100;
          if (p.x < -100) p.x = w + 100;
          const g = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.r * 45);
          g.addColorStop(0, "rgba(230,240,250,0.08)");
          g.addColorStop(1, "rgba(230,240,250,0)");
          ctx.fillStyle = g;
          ctx.arc(p.x, p.y, p.r * 45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          p.y += Math.sin(Date.now() * 0.001 + p.x) * 0.2;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 12);
          g.addColorStop(0, "rgba(255,225,150,0.25)");
          g.addColorStop(1, "rgba(255,200,100,0)");
          ctx.fillStyle = g;
          ctx.arc(p.x, p.y, p.r * 12, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) draw();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);
    draw();
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [conditionKey]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
