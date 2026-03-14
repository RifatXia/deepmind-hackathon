"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot } from "@/lib/spots";
import Link from "next/link";

// Fix leaflet icon issue in Next.js
const createIcon = (emoji: string, unlocked: boolean) => {
  return L.divIcon({
    html: `<div style="
      font-size: 28px;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${unlocked ? "rgba(22,163,74,0.3)" : "rgba(30,30,30,0.6)"};
      border: 2px solid ${unlocked ? "#22c55e" : "#333"};
      border-radius: 50%;
      ${unlocked ? "box-shadow: 0 0 12px rgba(34,197,94,0.4);" : "filter: grayscale(1); opacity: 0.5;"}
    ">${emoji}</div>`,
    className: "custom-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

function UserLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(loc);
      },
      () => {
        // Geolocation denied, center on Chicago
        map.setView([41.8827, -87.6233], 13);
      }
    );
  }, [map]);

  if (!position) return null;

  const userIcon = L.divIcon({
    html: `<div style="
      width: 16px;
      height: 16px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(59,130,246,0.6);
    "></div>`,
    className: "user-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return <Marker position={position} icon={userIcon} />;
}

interface MapViewProps {
  spots: Spot[];
  unlockedSpots: string[];
}

export default function MapView({ spots, unlockedSpots }: MapViewProps) {
  return (
    <MapContainer
      center={[41.886, -87.62]}
      zoom={13}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <UserLocationMarker />
      {spots.map((spot) => {
        const unlocked = unlockedSpots.includes(spot.id);
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createIcon(spot.emoji, unlocked)}
          >
            <Popup className="custom-popup">
              <div className="text-center p-1">
                <p className="font-bold text-sm">{spot.emoji} {spot.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {unlocked ? "✅ Visited" : `🔒 +${spot.points} XP`}
                </p>
                <Link
                  href={`/spot/${spot.id}`}
                  className="inline-block mt-2 text-xs text-green-600 font-bold underline"
                >
                  {unlocked ? "View Postcard" : "Visit Location"}
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
