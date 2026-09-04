# 16 — Rain Shelter Finder (60-sec)

**In 60 seconds:** When it's raining, a button appears: *Find shelter nearby*. Tap it → map shows 5 nearest covered stops (bus shelters, arcades, building entrances) within 800m, sorted by walking distance. Tap one → a dotted polyline draws the shortest foot route from you to it via OSRM.

## How it works

1. Visible only when `weatherCode in rain/drizzle/showers/thunder (51–82,95)` or `precipitation >0.3`.
2. `GET /api/shelters?lat&lon&radius=800` → Overpass `https://overpass-api.de/api/interpreter` query `node/way[amenity=shelter|shelter][building]; out center;` → `{shelters: {id,lat,lon,name,tags}[]}` (sanitized, 10s cache, 800m radius).
3. Client sorts by `haversineKm` → top 5, shows as list + map `Marker` (blue shelter icon).
4. `GET /api/route?from=lat,lon&to=lat,lon` → `http://router.project-osrm.org/route/v1/foot/{lon},{lat};{lon},{lat}?overview=full&geometries=geojson` → `{geometry: LineString}` (5s cache). Draw as `Polyline` dashed.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `GET /api/shelters` | Overpass query + sanitize | `lat,lon` | `{shelters}` | `app/api/shelters/route.ts:3` |
| `GET /api/route` | OSRM foot route | `from,to` | `GeoJSON` | `app/api/route/route.ts:3` |
| `RainShelterFinder({lat,lon,weatherCode})` | Button + list + polyline | props | JSX | `components/weather/RainShelterFinder.tsx:4` |

## Why this way

- Overpass is free, no key, OSM shelters are real covered stops. Nominatim would be address search, not amenity.
- OSRM foot profile is free, no key, `geometries=geojson` draws directly in Leaflet.

**5-year-old:** Like when it rains, you look for the nearest bus stop roof, and the map draws the shortest walk.

## Algorithm

1. `isRaining = [51…82,95,96,99].includes(code) || precip>0.3`.
2. `overpass: [out:json];(node[amenity=shelter](around:800,lat,lon);way[amenity=shelter](around...);node[building](around...)[shelter=yes];);out center 10;`.
3. `shelters.map(s=> ({... , km: haversine(lat,lon,s.lat,s.lon)})).sort((a,b)=>a.km-b.km).slice(0,5)`.
4. `osrm: GET router.../route/v1/foot/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`.
5. Draw `geometry.coordinates.map(([lon,lat]=> [lat,lon])` as `Polyline` dashed `5 8`.

## What could go wrong

| Case | What we do |
|---|---|
| Not raining | Hide button |
| Overpass 504 / no shelters | Show "No covered stops within 800m" |
| OSRM no route | Show straight line fallback |
