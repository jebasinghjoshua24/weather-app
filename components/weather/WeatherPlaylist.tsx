"use client";

import { useState } from "react";
import { moodForCode, playlistForMood, type Mood } from "@/lib/playlist";

export function WeatherPlaylist({
  weatherCode,
  isDay,
}: {
  weatherCode?: number | null;
  isDay?: number | null;
}) {
  const mood: Mood = moodForCode(weatherCode ?? undefined, isDay ?? undefined);
  const ids = playlistForMood(mood);
  const [idx, setIdx] = useState(0);
  const videoId = ids[idx % ids.length];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white capitalize">{mood} vibes</h3>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={`${mood} playlist`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {ids.map((id, i) => (
          <button
            key={id}
            onClick={() => setIdx(i)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border ${i === idx % ids.length ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/10 hover:bg-white/20"}`}
          >
            Track {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
