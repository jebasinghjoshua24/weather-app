"use client";

import { useState } from "react";
import { useSearchAutocomplete } from "@/hooks/useSearchAutocomplete";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function SearchBar({ onPick }: { onPick: (lat: number, lon: number, name: string) => void }) {
  const [q, setQ] = useState("");
  const { data, isPending } = useSearchAutocomplete(q);

  return (
    <div className="relative w-full max-w-md">
      <Input
        placeholder="Search city… (e.g. Mumbai, London)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search city"
        role="searchbox"
      />
      {isPending && <p className="absolute right-3 top-3 text-xs text-muted-foreground">…</p>}
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
