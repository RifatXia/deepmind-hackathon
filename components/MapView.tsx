"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Spot } from "@/lib/spots";
import Link from "next/link";

// ─── Marker icon factory ───────────────────────────────────────────────────────

function createSpotIcon(
  emoji: string,
  state: "locked" | "unlocked"
) {
  const isUnlocked = state === "unlocked";
  const size = isUnlocked ? 48 : 40;
  const fontSize = isUnlocked ? 24 : 20;

  let containerStyle = "";
  let badgeHtml = "";

  if (isUnlocked) {
    containerStyle = `
      width:${size}px; height:${size}px;
      background:rgba(22,163,74,0.22);
      border:2.5px solid rgba(34,197,94,0.75);
      border-radius:50%;
      animation:marker-unlocked-glow 2.5s ease-in-out infinite;
      display:flex; align-items:center; justify-content:center;
      font-size:${fontSize}px;
      position:relative;
      cursor:pointer;
    `;
    badgeHtml = `<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;
      background:#16a34a;border-radius:50%;border:2px solid #0a1a0a;
      display:flex;align-items:center;justify-content:center;font-size:8px;color:white;">✓</div>`;
  } else {
    containerStyle = `
      width:${size}px; height:${size}px;
      background:rgba(100,60,10,0.5);
      border:2px solid rgba(190,130,40,0.55);
      border-radius:50%;
      opacity:0.75;
      display:flex; align-items:center; justify-content:center;
      font-size:${fontSize}px;
      position:relative;
      cursor:pointer;
      filter:sepia(0.5) brightness(0.65);
    `;
    badgeHtml = `<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;
      background:#7c4a00;border-radius:50%;border:1.5px solid rgba(200,130,40,0.8);
      display:flex;align-items:center;justify-content:center;font-size:8px;">🔒</div>`;
  }

  return L.divIcon({
    html: `<div style="${containerStyle}">${emoji}${badgeHtml}</div>`,
    className: "chiquest-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

// ─── User location marker ────────────────────────────────────────────────────

function UserLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(loc);
        map.flyTo(loc, 14, { duration: 1.8 });
      },
      () => {
        map.setView([41.886, -87.62], 13);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!position) return null;

  const userIcon = L.divIcon({
    html: `
      <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
        <div class="user-pulse-ring" style="
          position:absolute;
          width:20px;height:20px;
          border-radius:50%;
          background:rgba(59,130,246,0.35);
          border:2px solid rgba(59,130,246,0.6);
        "></div>
        <div style="
          width:12px;height:12px;
          background:#3b82f6;
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 0 12px rgba(59,130,246,0.8);
          position:relative;z-index:1;
        "></div>
      </div>`,
    className: "chiquest-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return <Marker position={position} icon={userIcon} />;
}

// ─── Main MapView component ────────────────────────────────────────────────────

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      <UserLocationMarker />

      {spots.map((spot) => {
        const unlocked = unlockedSpots.includes(spot.id);
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createSpotIcon(spot.emoji, unlocked ? "unlocked" : "locked")}
            eventHandlers={{
              click: () => {
                window.location.href = `/spot/${spot.id}`;
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
