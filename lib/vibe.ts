/**
 * AI-free poetic weather vibes — hand-written, 3–5 per code × day/night.
 * Why table? 0ms, 0 cost, offline, deterministic. No AI needed for a line.
 */

type VibeEntry = { day: string[]; night: string[] };

const VIBE_MAP: Record<string, VibeEntry> = {
  "0": {
    day: [
      "The sun pours gold across the city.",
      "A sky of endless blue.",
      "Bright and boundless.",
      "Light warms every corner.",
      "Crystal clear, not a cloud in sight.",
    ],
    night: [
      "Stars scatter like diamonds on velvet.",
      "The moon keeps watch.",
      "A quiet, clear night.",
      "The sky is a dark mirror.",
      "Constellations whisper overhead.",
    ],
  },
  "1": {
    day: ["Sunlight dances through a thin veil.", "Mostly bright, a whisper of cloud.", "The sun plays hide-and-seek."],
    night: ["A few clouds drift under starlight.", "Clear with a hint of haze.", "Night holds its breath."],
  },
  "2": {
    day: ["Clouds gather like soft cotton.", "Half sun, half shade.", "The sky wears patches."],
    night: ["Moonlight filters through gaps.", "Partly veiled, partly seen.", "Clouds frame the stars."],
  },
  "3": {
    day: ["The sky wears a silver veil.", "Grey spreads like ink in water.", "Overcast and calm."],
    night: ["Clouds blanket the night.", "A heavy, quiet dark.", "Stars hidden behind grey."],
  },
  "45": {
    day: ["Misty air softens the world.", "Fog curls around rooftops.", "The city exhales mist."],
    night: ["Fog swallows the streetlights.", "A white hush at night.", "Mist wraps the dark."],
  },
  "48": {
    day: ["Frosted fog clings to edges.", "Rime whispers on windows.", "Cold mist, delicate and sharp."],
    night: ["Frozen fog under pale light.", "Night glitters with rime.", " icy veil, silent."],
  },
  "51": {
    day: ["A fine drizzle kisses the skin.", "Soft rain, barely there.", "The air weeps lightly."],
    night: ["Drizzle patters in the dark.", "Night drizzle, soft as breath.", "Wet streets gleam."],
  },
  "53": {
    day: ["Steady drizzle paints the streets.", "A gentle, persistent rain.", "Umbrellas bloom."],
    night: ["Drizzle drums on rooftops.", "Night rain, steady and low.", "Reflections ripple."],
  },
  "55": {
    day: ["Dense drizzle, world blurred.", "The sky spills softly.", "A grey, wet hush."],
    night: ["Heavy drizzle in the dark.", "Night blurs with rain.", "Streets shine like mirrors."],
  },
  "61": {
    day: ["Light rain taps a quiet rhythm.", "Soft drops on warm air.", "A fresh, light shower."],
    night: ["Light rain threads the night.", "Drops glint under lamps.", "Night rain, gentle and cool."],
  },
  "63": {
    day: ["Moderate rain steadies the day.", "Rain draws lines on windows.", "The city listens to rain."],
    night: ["Rain fills the dark with sound.", "Steady drops, steady night.", "Puddles catch the lights."],
  },
  "65": {
    day: ["Heavy rain hammers the roofs.", "Water rushes, sky unloads.", "A soaking, roaring rain."],
    night: ["Night drowns in heavy rain.", "Thunderless, but relentless.", "Sheets of water in the dark."],
  },
  "71": {
    day: ["Snow dusts the world white.", "Flakes flutter, light and cold.", "A soft snowy veil."],
    night: ["Snow glows under streetlights.", "Silent flakes in the dark.", "Night turns white."],
  },
  "73": {
    day: ["Snow falls steadily.", "The ground turns white.", "A quiet snowfall."],
    night: ["Steady snow, muffled night.", "White blankets the dark.", "Flakes gather on sills."],
  },
  "75": {
    day: ["Heavy snow, world softened.", "Whiteout hush.", "Snow piles, silence deepens."],
    night: ["Blizzard whispers at the door.", "Night buried in snow.", "Heavy flakes, heavy dark."],
  },
  "80": {
    day: ["Quick showers, sun then rain.", "Sun breaks through showers.", "Light bursts of rain."],
    night: ["Night showers come and go.", "Brief rain in the dark.", "Wet, then dry, then wet."],
  },
  "81": {
    day: ["Showers pass, clouds race.", "Rain in bursts.", "The sky can't decide."],
    night: ["Night showers patter, then hush.", "Intermittent rain.", "Clouds hurry past."],
  },
  "82": {
    day: ["Violent showers, sky in a rush.", "Rain crashes down.", "A sudden drenching."],
    night: ["Night showers slam the roofs.", "Fierce bursts in the dark.", "Rain like thrown stones."],
  },
  "95": {
    day: ["Thunder growls, sky flashes.", "Storm cracks the air.", "Lightning splits the blue."],
    night: ["Thunder rolls through the dark.", "Lightning scars the night.", "Storm wakes the city."],
  },
  "96": {
    day: ["Thunder with icy teeth.", "Storm and hail together.", "The sky throws stones."],
    night: ["Hail clatters in the dark.", "Thunder and ice at night.", "Storm bites."],
  },
  "99": {
    day: ["Fierce storm, hail hammers.", "The sky unloads ice.", "A wild, white storm."],
    night: ["Night hail, night thunder.", "Ice and lightning together.", "The dark shatters."],
  },
  default: {
    day: ["The weather does its own thing today.", "Sky, doing its thing.", "Another day, another sky."],
    night: ["Night air, whatever the weather.", "The sky keeps its secrets.", "Weather, quietly."],
  },
};

export function getVibe(code: number, isDay: number, seed: number = Date.now()): string {
  const key = String(code);
  const entry = VIBE_MAP[key] ?? VIBE_MAP.default;
  const arr = isDay ? entry.day : entry.night;
  const idx = Math.abs(seed + code * 31 + isDay) % arr.length;
  return arr[idx];
}
