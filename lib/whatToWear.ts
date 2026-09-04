/** What to Wear — rule engine, AI-free. */

export interface Outfit {
  layers: string[];
  tip: string;
}

export function suggestOutfit(opts: {
  temperature?: number | null;
  windSpeed?: number | null;
  precipitation?: number | null;
  weatherCode?: number | null;
}): Outfit {
  const { temperature, windSpeed, precipitation, weatherCode } = opts;
  if (temperature == null || !Number.isFinite(temperature)) {
    return { layers: [], tip: "Weather data unavailable" };
  }
  const t = temperature;
  const layers: string[] = [];

  if (t > 28) layers.push("T-shirt", "Shorts");
  else if (t > 22) layers.push("Light shirt", "Shorts");
  else if (t > 15) layers.push("Sweater", "Jeans");
  else if (t > 5) layers.push("Jacket", "Long sleeves");
  else layers.push("Heavy jacket", "Scarf", "Gloves");

  if (typeof windSpeed === "number" && windSpeed > 20) layers.push("Windbreaker");
  const isWet = (typeof precipitation === "number" && precipitation > 0.5) || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode ?? -1);
  if (isWet) layers.push("Umbrella");
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) layers.push("Boots", "Gloves");

  // Deduplicate
  const uniq = [...new Set(layers)];
  let tip = "";
  if (t > 28) tip = "Light & breezy — stay hydrated";
  else if (t < 5) tip = "Bundle up — freezing";
  else if (isWet) tip = "Carry rain protection";
  else if ((windSpeed ?? 0) > 20) tip = "Windy — layers help";
  else tip = "Comfortable — light layers";

  return { layers: uniq, tip };
}
