"use client";

import { useCallback, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSearchAutocomplete } from "@/hooks/useSearchAutocomplete";
import { useSpeechRecognition } from "@/hooks/useSpeech";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function SearchBar({ onPick }: { onPick: (lat: number, lon: number, name: string) => void }) {
  const [q, setQ] = useState("");
  const { data, isPending } = useSearchAutocomplete(q);
  const onResult = useCallback((t: string) => setQ(t), []);
  const { supported: voiceSupported, listening, start, stop } = useSpeechRecognition(onResult);

  return (
    <div className="relative w-full max-w-md">
      <div className="flex gap-2">
        <Input
          placeholder="Search city… (e.g. Mumbai, London)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search city"
          role="searchbox"
          className="flex-1"
        />
        {voiceSupported && (
          <button
            onClick={listening ? stop : start}
            aria-label={listening ? "Stop listening" : "Voice search"}
            aria-pressed={listening}
            className={`rounded-xl p-2 border backdrop-blur-md ${listening ? "bg-red-500 text-white border-red-400 animate-pulse" : "bg-slate-900/40 text-slate-200 border-white/10 hover:bg-white/10"}`}
          >
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
      </div>
      {isPending && <p className="absolute right-14 top-3 text-xs text-muted-foreground">…</p>}
      {data && data.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full">
          <CardContent className="p-2">
            {data.map((r) => (
              <button
                key={r.id}
                className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onPick(r.latitude, r.longitude, r.name);
                  setQ("");
                }}
              >
                {r.name}
                {r.admin1 ? `, ${r.admin1}` : ""} {r.country ? `· ${r.country}` : ""}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
