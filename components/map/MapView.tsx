"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";

// Fix Leaflet default icon (Next.js doesn't serve images from leaflet package automatically)
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 10, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapView({
  lat,
  lon,
  name,
  onPick,
}: {
  lat: number;
  lon: number;
  name: string;
  onPick: (lat: number, lon: number, name: string) => void;
}) {
  const [clickPos, setClickPos] = useState<{ lat: number; lon: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: reverse } = useReverseGeocode(clickPos?.lat ?? null, clickPos?.lon ?? null, clickPos !== null);

  useEffect(() => {
    if (reverse !== undefined && clickPos) {
      const label = reverse?.name
        ? `${reverse.name}${reverse.country ? `, ${reverse.country}` : ""}`
        : `${clickPos.lat.toFixed(2)}, ${clickPos.lon.toFixed(2)}`;
      onPick(clickPos.lat, clickPos.lon, label);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear click state after reverse resolves (one-shot)
      setClickPos(null);
    }
  }, [reverse, clickPos, onPick]);

  const handleMapClick = (cLat: number, cLon: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setClickPos({ lat: cLat, lon: cLon }), 400);
  };

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return <div className="h-64 rounded-xl border bg-muted p-4 text-sm text-muted-foreground">Map unavailable</div>;
  }

  return (
    <div className="h-64 overflow-hidden rounded-xl border">
      <MapContainer
        center={[lat, lon]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>{name}</Popup>
        </Marker>
        <FlyTo lat={lat} lon={lon} />
        <ClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
