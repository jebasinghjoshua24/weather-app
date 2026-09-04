"use client";

import { useEffect, useMemo, useState } from "react";
import { useRainViewer } from "@/hooks/useRainViewer";

export function RadarTimeline({ onFrameChange }: { onFrameChange: (host: string, path: string | null) => void }) {
  const { data, isPending, isError } = useRainViewer();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frames = useMemo(() => data?.frames ?? [], [data?.frames]);
  const host = data?.host ?? "";

  // Reset idx when frames load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync idx to loaded frames (one-shot)
    if (frames.length) setIdx(frames.length - 1);
  }, [frames.length]);

  // Notify parent of current frame path
  useEffect(() => {
    if (!frames.length) {
      onFrameChange(host, null);
      return;
    }
    const f = frames[idx];
    onFrameChange(host, f ? f.path : null);
  }, [frames, idx, host, onFrameChange]);

  // Auto-play
  useEffect(() => {
    if (!playing || !frames.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), 600);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  if (isPending) return <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-3 text-xs text-slate-400">Loading radar…</div>;
  if (isError || !frames.length) return null;

  const timeLabel = frames[idx] ? new Date(frames[idx].time * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "--";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3 backdrop-blur-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-300">Radar {timeLabel}</span>
        <button onClick={() => setPlaying((v) => !v)} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={frames.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full accent-amber-400"
        aria-label="Radar timeline"
      />
      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span>{new Date(frames[0].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <span>{new Date(frames[frames.length - 1].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
