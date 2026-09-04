"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Compass,
  Eye,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
  Search,
  MapPin,
  RefreshCw,
  Thermometer,
  Feather,
  ArrowUpRight,
  Radio,
  Layers,
  Zap,
  Navigation,
  Hand,
  Move,
} from "lucide-react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeatherData } from "@/hooks/useWeatherData";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { SearchBar } from "@/components/weather/SearchBar";
import { wmoToDescription } from "@/lib/open-meteo";
import { Button } from "@/components/ui/button";

const CITY_PRESETS = [
  { name: "Reykjavík", country: "Iceland", lat: 64.1466, lon: -21.9426, condition: "snow", temp: -2, humidity: 88, wind: 28, windDir: 315, pressure: 994, cloud: 92, uvi: 1, aqi: 12, vibe: "Frosted silence blankets the volcanic plains." },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, condition: "rain", temp: 16, humidity: 92, wind: 14, windDir: 180, pressure: 1008, cloud: 85, uvi: 3, aqi: 35, vibe: "Neon reflections shimmer through steady rainfall." },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, condition: "clear", temp: 34, humidity: 24, wind: 12, windDir: 45, pressure: 1014, cloud: 5, uvi: 10, aqi: 78, vibe: "Golden heat radiates off ancient desert sands." },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, condition: "sunset", temp: 21, humidity: 55, wind: 9, windDir: 225, pressure: 1018, cloud: 30, uvi: 5, aqi: 28, vibe: "Light warms every corner of the zinc rooftops." },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006, condition: "cloudy", temp: 18, humidity: 60, wind: 18, windDir: 290, pressure: 1012, cloud: 70, uvi: 4, aqi: 42, vibe: "Crisp Atlantic breeze drafts through steel canyons." },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, condition: "clear", temp: 26, humidity: 48, wind: 22, windDir: 120, pressure: 1020, cloud: 10, uvi: 8, aqi: 18, vibe: "Oceanic shimmer bathes the harbor in cobalt." },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, condition: "storm", temp: 13, humidity: 95, wind: 38, windDir: 240, pressure: 988, cloud: 98, uvi: 2, aqi: 25, vibe: "Thunder rumbles as rain strikes the glass dome." },
];

const getSkyColorForTime = (timeHour: number, condition: string) => {
  const isNight = timeHour < 5 || timeHour > 20;
  const isTwilight = (timeHour >= 5 && timeHour < 7) || (timeHour >= 17 && timeHour <= 20);
  if (isNight) {
    return { skyGradient: "from-slate-950 via-indigo-950/80 to-black", ambientGlow: "hsl(230, 40%, 15%)", accentColor: "#818cf8", horizonGlow: "rgba(99, 102, 241, 0.2)", moteColor: "rgba(199, 210, 254, 0.5)" };
  }
  if (isTwilight || condition === "sunset") {
    return { skyGradient: "from-amber-600/50 via-rose-900/40 to-slate-950", ambientGlow: "hsl(18, 90%, 55%)", accentColor: "#f97316", horizonGlow: "rgba(249, 115, 22, 0.5)", moteColor: "rgba(253, 186, 116, 0.7)" };
  }
  switch (condition) {
    case "rain":
      return { skyGradient: "from-sky-900/50 via-slate-800/60 to-zinc-950", ambientGlow: "hsl(200, 45%, 40%)", accentColor: "#38bdf8", horizonGlow: "rgba(56, 189, 248, 0.35)", moteColor: "rgba(186, 230, 253, 0.6)" };
    case "storm":
      return { skyGradient: "from-purple-950/70 via-slate-900/70 to-black", ambientGlow: "hsl(270, 50%, 30%)", accentColor: "#c084fc", horizonGlow: "rgba(192, 132, 252, 0.45)", moteColor: "rgba(233, 213, 255, 0.8)" };
    case "snow":
      return { skyGradient: "from-cyan-900/40 via-slate-800/40 to-slate-950", ambientGlow: "hsl(190, 70%, 85%)", accentColor: "#22d3ee", horizonGlow: "rgba(165, 243, 252, 0.4)", moteColor: "rgba(255, 255, 255, 0.9)" };
    case "cloudy":
      return { skyGradient: "from-slate-600/40 via-slate-800/40 to-zinc-950", ambientGlow: "hsl(215, 20%, 60%)", accentColor: "#94a3b8", horizonGlow: "rgba(148, 163, 184, 0.3)", moteColor: "rgba(226, 232, 240, 0.5)" };
    default:
      return { skyGradient: "from-amber-400/40 via-sky-500/30 to-indigo-950", ambientGlow: "hsl(38, 92%, 85%)", accentColor: "#f59e0b", horizonGlow: "rgba(251, 191, 36, 0.4)", moteColor: "rgba(254, 243, 199, 0.7)" };
  }
};

class WeatherAudioSynth {
  ctx: AudioContext | null = null;
  rainGain: GainNode | null = null;
  windGain: GainNode | null = null;
  rainFilter: BiquadFilterNode | null = null;
  isPlaying = false;

  init() {
    if (this.ctx) return;
    const AudioCtx = (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext }).AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    const bufferSize = this.ctx.sampleRate * 2;
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = rainBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = rainBuffer;
    whiteNoise.loop = true;
    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = "lowpass";
    this.rainFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    whiteNoise.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    whiteNoise.start();
    const windOsc = this.ctx.createOscillator();
    windOsc.type = "sine";
    windOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    windOsc.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    windOsc.start();
  }

  setWeather(condition: string, surge: number) {
    if (!this.ctx || !this.isPlaying) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    const baseVol = 0.2 + surge * 0.3;
    const cutoff = 800 + surge * 2400;
    if (condition === "rain" || condition === "storm" || surge > 0.1) {
      this.rainGain?.gain.setTargetAtTime(baseVol * 0.25, this.ctx.currentTime, 0.2);
      this.rainFilter?.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.2);
      this.windGain?.gain.setTargetAtTime(baseVol * 0.1, this.ctx.currentTime, 0.2);
    } else if (condition === "snow" || condition === "cloudy") {
      this.rainGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      this.windGain?.gain.setTargetAtTime(baseVol * 0.08, this.ctx.currentTime, 0.3);
    } else {
      this.rainGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      this.windGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
  }

  toggle(condition: string) {
    if (!this.ctx) this.init();
    this.isPlaying = !this.isPlaying;
    this.setWeather(condition, 0);
    return this.isPlaying;
  }
}

const audioSynth = new WeatherAudioSynth();

const InteractiveAtmosphereCanvas = ({ condition, surgeIntensity, parallax }: { condition: string; surgeIntensity: number; parallax: { x: number; y: number } }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const windRef = React.useRef<Array<{ x: number; y: number; dx: number; dy: number; radius: number; life: number }>>([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    onResize();
    window.addEventListener("resize", onResize);

    const count = condition === "storm" ? 240 : condition === "rain" ? 160 : condition === "snow" ? 120 : 50;
    const ps = Array.from({ length: Math.floor(count * (1 + surgeIntensity * 2.5)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.8 + 0.6,
      sx: (Math.random() - 0.5) * 1.5,
      sy: condition === "rain" || condition === "storm" ? Math.random() * 12 + 8 : condition === "snow" ? Math.random() * 1.5 + 0.8 : Math.random() * 0.5 - 0.25,
      len: Math.random() * 22 + 8,
      o: Math.random() * 0.7 + 0.2,
      a: Math.random() * Math.PI * 2,
    }));

    let flash = false;
    let flashTimer = 0;
    const handleMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      windRef.current.push({ x, y, dx: (Math.random() - 0.5) * 12, dy: (Math.random() - 0.5) * 12, radius: 90, life: 1 });
      if (windRef.current.length > 14) windRef.current.shift();
    };
    window.addEventListener("pointermove", handleMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      windRef.current.forEach((w) => {
        w.life -= 0.02;
      });
      windRef.current = windRef.current.filter((w) => w.life > 0);
      if (condition === "storm" || surgeIntensity > 0.6) {
        flashTimer++;
        if (flashTimer > 160 / (1 + surgeIntensity * 2) && Math.random() < 0.04) {
          flash = true;
          flashTimer = 0;
          setTimeout(() => (flash = false), 90);
        }
        if (flash) {
          ctx.fillStyle = `rgba(255,255,255,${0.25 + surgeIntensity * 0.35})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      ps.forEach((p) => {
        let ax = 0,
          ay = 0;
        windRef.current.forEach((w) => {
          const d = Math.hypot(p.x - w.x, p.y - w.y);
          if (d < w.radius) {
            const f = (1 - d / w.radius) * w.life * 2.5;
            ax += w.dx * f * 0.02;
            ay += w.dy * f * 0.02;
          }
        });
        const px = parallax.x * (p.r * 0.3);
        const py = parallax.y * (p.r * 0.3);
        ctx.beginPath();
        if (condition === "rain" || condition === "storm" || surgeIntensity > 0.2) {
          const len = p.len * (1 + surgeIntensity * 1.2);
          ctx.strokeStyle = `rgba(186,230,253,${Math.min(1, p.o + surgeIntensity * 0.3)})`;
          ctx.lineWidth = 1.2 + surgeIntensity * 0.8;
          ctx.moveTo(p.x + px, p.y + py);
          ctx.lineTo(p.x + px + ax * 6, p.y + py + len + ay * 6);
          ctx.stroke();
          p.y += p.sy + surgeIntensity * 10;
          p.x += p.sx + ax;
          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        } else if (condition === "snow") {
          ctx.fillStyle = `rgba(255,255,255,${p.o})`;
          ctx.arc(p.x + px, p.y + py, p.r * (1 + surgeIntensity), 0, Math.PI * 2);
          ctx.fill();
          p.y += p.sy * 0.2 + surgeIntensity * 3;
          p.x += Math.sin(p.a) * 1.5 + ax * 0.1;
          p.a += 0.02;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        } else {
          ctx.fillStyle = `rgba(254,243,199,${p.o * 0.8})`;
          ctx.arc(p.x + px, p.y + py, p.r * 1.4, 0, Math.PI * 2);
          ctx.fill();
          p.y -= 0.3 + surgeIntensity * 2;
          if (p.y < 0) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [condition, surgeIntensity, parallax.x, parallax.y]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden />;
};

const MicroSparkline = ({ data, color = "#38bdf8", height = 24, width = 80 }: { data: number[]; color?: string; height?: number; width?: number }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 6) - 3}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export default function ObservatoryPage() {
  const shouldReduce = useReducedMotion();
  const { location, setLocation } = useWeatherStore();
  const { request } = useGeolocation();
  const { data: liveData } = useWeatherData(location?.lat ?? null, location?.lon ?? null);
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [timeHour, setTimeHour] = useState(14.5);
  const [isCalmMode, setIsCalmMode] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [searchQuery, setSearchQuery] = useState("");
  const [surgeIntensity, setSurgeIntensity] = useState(0);
  const [isHoldingSurge, setIsHoldingSurge] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGuideModal, setShowGuideModal] = useState(false);
  const surgeRef = React.useRef<number | null>(null);

  // eslint-disable-next-line
  const city = useMemo(() => {
    if (liveData && location) {
      const code = liveData.current.weatherCode;
      const cond = code === 0 ? "clear" : [1, 2].includes(code) ? "clear" : code === 3 ? "cloudy" : [45, 48].includes(code) ? "fog" : [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code) ? "rain" : [71, 73, 75, 85, 86].includes(code) ? "snow" : [95, 96, 99].includes(code) ? "storm" : "clear";
      return {
        ...selectedCity,
        name: location.name,
        country: (location as unknown as { country?: string }).country || selectedCity.country,
        temp: Math.round(liveData.current.temperature),
        condition: cond,
        vibe: `Live: ${wmoToDescription(code)} at ${location.name}.`,
        humidity: liveData.current.humidity ?? selectedCity.humidity,
        wind: Math.round(liveData.current.windSpeed),
        pressure: liveData.current.pressure ? Math.round(liveData.current.pressure) : selectedCity.pressure,
        cloud: liveData.current.cloudCover ?? selectedCity.cloud,
      };
    }
    return selectedCity;
  }, [liveData, location, selectedCity]);

  const currentSky = useMemo(() => getSkyColorForTime(timeHour, city.condition), [timeHour, city.condition]);
  const displayTemp = (c: number) => (unit === "C" ? `${c}°` : `${Math.round((c * 9) / 5 + 32)}°`);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    setMousePos({ x, y });
  };

  const handleSurgeStart = () => {
    setIsHoldingSurge(true);
    const id = window.setInterval(() => {
      setSurgeIntensity((p) => {
        const n = Math.min(1, p + 0.05);
        audioSynth.setWeather(city.condition, n);
        return n;
      });
    }, 50);
    surgeRef.current = id as unknown as number;
  };
  const handleSurgeEnd = () => {
    setIsHoldingSurge(false);
    if (surgeRef.current) window.clearInterval(surgeRef.current);
    const id = window.setInterval(() => {
      setSurgeIntensity((p) => {
        if (p <= 0.02) {
          window.clearInterval(id);
          audioSynth.setWeather(city.condition, 0);
          return 0;
        }
        const n = p * 0.82;
        audioSynth.setWeather(city.condition, n);
        return n;
      });
    }, 30);
  };

  const toggleAudio = () => {
    const active = audioSynth.toggle(city.condition);
    setIsAudioActive(active);
  };

  const filteredCities = CITY_PRESETS.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.country.toLowerCase().includes(searchQuery.toLowerCase()));

  // Keep existing geolocation wiring
  useEffect(() => {
    if (!location) request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen w-full text-zinc-100 bg-zinc-950 overflow-x-hidden font-sans select-none">
      {!isCalmMode && <InteractiveAtmosphereCanvas condition={city.condition} surgeIntensity={surgeIntensity} parallax={mousePos} />}
      <div className="fixed inset-0 pointer-events-none transition-all duration-700 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${currentSky.skyGradient})` as unknown as string }} />
      <div className="fixed inset-0 pointer-events-none z-20 border-[10px] sm:border-[14px] border-zinc-900/50 rounded-3xl shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]">
        <div className="absolute top-3 left-6 right-6 flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${isHoldingSurge ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
            <span>ATMOS TERRARIUM v3.5</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span>SOLAR ELEVATION: {Math.round(Math.sin((timeHour / 24) * Math.PI) * 90)}°</span>
            <span className="text-amber-400/90 font-semibold">{isHoldingSurge ? "SURGE ACTIVE" : "REFRACTION: 1.042"}</span>
          </div>
        </div>
      </div>

      <div className="relative z-30 max-w-7xl mx-auto min-h-screen px-4 sm:px-8 py-8 flex flex-col justify-between">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white flex items-center gap-2">
                <span className="font-serif italic text-amber-400">Atmos</span> Terrarium
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest bg-white/10 rounded-full border border-white/10 uppercase text-zinc-300">{city.condition}</span>
            </div>
            <p className="text-xs font-serif italic text-amber-200/80 mt-1 max-w-md">“{city.vibe}”</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowGuideModal(true)} className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-md text-xs font-mono flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">GESTURES</span>
            </button>
            <button onClick={toggleAudio} className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-mono flex items-center gap-2 ${isAudioActive ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-zinc-900/70 border-white/10 text-zinc-400 hover:text-white"}`}>
              {isAudioActive ? <Volume2 className="w-4 h-4 animate-pulse text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioActive ? "AUDIO LIVE" : "MUTED"}</span>
            </button>
            <button onClick={() => setIsCalmMode(!isCalmMode)} className={`p-2.5 rounded-xl border backdrop-blur-md text-xs font-mono flex items-center gap-2 ${isCalmMode ? "bg-zinc-100 text-zinc-900 border-white font-medium" : "bg-zinc-900/70 border-white/10 text-zinc-400 hover:text-white"}`}>
              <Feather className="w-4 h-4" />
              <span>{isCalmMode ? "CALM ON" : "IMMERSIVE"}</span>
            </button>
            <button onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))} className="p-2.5 rounded-xl bg-zinc-900/70 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-md text-xs font-mono">
              °{unit}
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" placeholder="Search station..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 backdrop-blur-md" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredCities.slice(0, 6).map((c) => (
              <button key={c.name} onClick={() => setSelectedCity(c)} className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap border ${selectedCity.name === c.name ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:bg-zinc-800/60"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={shouldReduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-auto">
          <div className="lg:col-span-7 flex flex-col justify-between min-h-[420px] p-6 sm:p-8 rounded-3xl bg-zinc-950/50 border border-white/10 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
              <svg className="w-full h-full" viewBox="0 0 400 280">
                <path d="M 20,230 Q 200,20 380,230" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx={20 + (timeHour / 24) * 360} cy={230 - Math.sin((timeHour / 24) * Math.PI) * 200} r={8 + surgeIntensity * 6} fill={currentSky.accentColor} className="transition-all duration-150" />
              </svg>
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedCity.name}, {selectedCity.country}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">STATION #0492</div>
              </div>
              <div className="text-right font-mono text-xs text-zinc-400">
                <div>SOLAR TIME</div>
                <div className="text-white font-semibold text-sm">
                  {String(Math.floor(timeHour)).padStart(2, "0")}:{String(Math.floor((timeHour % 1) * 60)).padStart(2, "0")}
                </div>
              </div>
            </div>
            <div onPointerDown={handleSurgeStart} onPointerUp={handleSurgeEnd} onPointerLeave={handleSurgeEnd} className="relative z-10 my-6 cursor-pointer touch-none select-none active:scale-[0.98] transition-transform">
              <div className="flex items-baseline gap-4">
                <span className={`text-7xl sm:text-9xl font-extralight tracking-tighter text-white font-sans transition-all duration-300 ${isHoldingSurge ? "text-amber-300 scale-105" : ""}`}>{displayTemp(city.temp)}</span>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-light text-zinc-300 capitalize">{city.condition}</span>
                  <span className="text-xs font-mono text-zinc-400">FEELS LIKE {displayTemp(city.temp - 2)}</span>
                  <span className="text-[10px] font-mono text-amber-400/90 mt-2 flex items-center gap-1 opacity-80">
                    <Zap className="w-3 h-3 animate-pulse" />
                    {isHoldingSurge ? "SURGING ATMOSPHERE..." : "HOLD TO SURGE ATMOSPHERE"}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative z-10 space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> DAWN 06:00
                </span>
                <span className="text-amber-400 font-medium">SLING SOLAR ARC: {Math.floor(timeHour)}:00</span>
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> DUSK 20:00
                </span>
              </div>
              <input type="range" min="0" max="23.9" step="0.1" value={timeHour} onChange={(e) => setTimeHour(Number(e.target.value))} className="w-full accent-amber-400 bg-zinc-800 h-2 rounded-lg appearance-none cursor-grab active:cursor-grabbing" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl bg-zinc-900/70 border border-white/10 p-5 backdrop-blur-xl relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 uppercase">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Observatory AI Briefing
                </div>
              </div>
              <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed font-light">Terrarium diagnostic: Thermal variance holds at {city.temp}°C with wind {city.wind} km/h. Pressure {city.pressure} hPa — {city.vibe}</p>
            </div>
            <div className="relative p-5 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-3 right-3 text-[10px] font-mono text-zinc-500">DESK POLAROID #088</div>
              <div className="relative h-40 rounded-xl overflow-hidden mb-3 border border-white/10">
                <div className={`absolute inset-0 bg-gradient-to-tr ${currentSky.skyGradient}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-3 backdrop-blur-md bg-black/30 rounded-xl border border-white/10">
                    <div className="text-3xl mb-1">{city.condition === "clear" ? "☀️" : city.condition === "rain" ? "🌧️" : city.condition === "snow" ? "❄️" : "🌩️"}</div>
                    <div className="text-[10px] font-mono text-zinc-200 uppercase tracking-widest">{city.name} ATMOSPHERE</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-zinc-400 flex justify-between">
                  <span>
                    AIR QUALITY: <strong className="text-emerald-400">{city.aqi} AQI</strong>
                  </span>
                  <span>
                    UV INDEX: <strong className="text-amber-400">{city.uvi} / 10</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.section initial={shouldReduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.08 }} className="mt-6">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">TELEMETRY INSTRUMENT STRIP — DENSE tabular-nums</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-[11px] font-mono">HUMIDITY</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-mono font-semibold text-white">{city.humidity}%</span>
                <MicroSparkline data={Array.from({ length: 12 }, (_, i) => city.humidity + Math.sin(i) * 4)} color="#38bdf8" />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-[11px] font-mono">WIND VELOCITY</span>
                <Wind className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-mono font-semibold text-white">
                  {city.wind} <span className="text-xs font-normal text-zinc-500">km/h</span>
                </span>
                <MicroSparkline data={Array.from({ length: 12 }, (_, i) => city.wind + Math.cos(i) * 6)} color="#f59e0b" />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-[11px] font-mono">BAROMETRIC</span>
                <Compass className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-mono font-semibold text-white">
                  {city.pressure} <span className="text-xs font-normal text-zinc-500">hPa</span>
                </span>
                <MicroSparkline data={Array.from({ length: 12 }, (_, i) => city.pressure + Math.sin(i * 0.3) * 3)} color="#c084fc" />
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-[11px] font-mono">CLOUD COVER</span>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-mono font-semibold text-white">{city.cloud}%</span>
                <MicroSparkline data={Array.from({ length: 12 }, (_, i) => city.cloud + Math.sin(i) * 2)} color="#10b981" />
              </div>
            </div>
          </div>
        </motion.section>

        <footer className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-zinc-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>ATMOS OBSERVATORY TERRARIUM — GESTURE REACTIVE WEATHER SYSTEM</span>
          </div>
          <div className="flex items-center gap-4">
            <span>STATION COORD: 64.14°N</span>
            <span>SYSTEM STATUS: OPTIMAL</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
