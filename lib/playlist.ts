/** Weather Mood → YouTube embeds (no key, curated). */

export type Mood = "sunny" | "partly" | "cloudy" | "rainy" | "snow" | "storm" | "fog";

export function moodForCode(code: number | undefined, isDay: number | undefined): Mood {
  if (code == null) return "sunny";
  if (code === 0) return isDay === 0 ? "cloudy" : "sunny";
  if ([1, 2].includes(code)) return "partly";
  if (code === 3) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "sunny";
}

// Curated YouTube IDs (youtube-nocookie, no key). Each mood has 2–3 fallbacks.
export const PLAYLISTS: Record<Mood, string[]> = {
  sunny: ["ZbZSe6N_BXs", "lTRiuFIWV54"], // sunny / upbeat
  partly: ["9bZkp7q19f0", "OPf0YbXqDm0"],
  cloudy: ["hFAOXdGZ-BU", "2Vv-BfVoq4g"],
  rainy: ["mPZkdNFkNps", "5qap5aO4i9A"], // lo-fi rain
  snow: ["sGkh1W5cbH4", "5qap5aO4i9A"],
  storm: ["n4tK7LYFxI0", "5qap5aO4i9A"],
  fog: ["hFAOXdGZ-BU", "lTRiuFIWV54"],
};

export function playlistForMood(mood: Mood): string[] {
  return PLAYLISTS[mood] ?? PLAYLISTS.sunny;
}
