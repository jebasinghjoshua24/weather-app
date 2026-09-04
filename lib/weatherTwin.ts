/** Weather Twin — city DB + scoring. */

export interface TwinCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const TWIN_CITIES: TwinCity[] = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lon: 101.6869 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.389 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426 },
];

export function scoreTwin(
  user: { temp: number; humidity?: number | null; wind?: number | null; code?: number | null },
  cand: { temp: number; humidity?: number | null; wind?: number | null; code?: number | null }
): number {
  const tDiff = Math.abs((user.temp ?? 0) - (cand.temp ?? 0));
  const hDiff = Math.abs((user.humidity ?? 50) - (cand.humidity ?? 50));
  const wDiff = Math.abs((user.wind ?? 10) - (cand.wind ?? 10));
  const codeDiff = user.code === cand.code ? 0 : 12;
  const raw = 100 - tDiff * 4 - hDiff * 0.6 - wDiff * 1.5 - codeDiff;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterFarCities(lat: number, lon: number, cities: TwinCity[]): TwinCity[] {
  return cities.filter((c) => haversineKm(lat, lon, c.lat, c.lon) > 300);
}
