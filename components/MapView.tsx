"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SPOTS } from "@/lib/spots";
import type { LocationStatus } from "@/components/UserLocationBadge";

// ─── Marker icon factory ───────────────────────────────────────────────────────

function createSpotIcon(
  emoji: string,
  state: "locked" | "unlocked" | "selected"
) {
  const isSelected = state === "selected";
  const isUnlocked = state === "unlocked" || isSelected;

  const size = isSelected ? 56 : isUnlocked ? 48 : 40;
  const fontSize = isSelected ? 28 : isUnlocked ? 24 : 20;

  let containerStyle = "";
  let badgeHtml = "";

  if (isSelected) {
    containerStyle = `
      width:${size}px; height:${size}px;
      background:rgba(202,138,4,0.18);
      border:3px solid rgba(202,138,4,0.9);
      border-radius:50%;
      animation:marker-selected-glow 2s ease-in-out infinite;
      display:flex; align-items:center; justify-content:center;
      font-size:${fontSize}px;
      position:relative;
      cursor:pointer;
    `;
    badgeHtml = `<div style="position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;
      background:#ca8a04;border-radius:50%;border:2px solid #0a1a0a;
      display:flex;align-items:center;justify-content:center;font-size:9px;">⭐</div>`;
  } else if (isUnlocked) {
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
    // locked — amber/slate tint so it's visible on the dark map
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

// ─── Sub-components (must be children of MapContainer) ────────────────────────

interface UserLocationMarkerProps {
  onLocationUpdate: (
    loc: [number, number] | null,
    status: LocationStatus
  ) => void;
}

function UserLocationMarker({ onLocationUpdate }: UserLocationMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      onLocationUpdate(null, "unavailable");
      return;
    }

    onLocationUpdate(null, "locating");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(loc);
        onLocationUpdate(loc, "found");
        // Smooth fly-in on first location
        map.flyTo(loc, 14, { duration: 1.8 });
      },
      () => {
        onLocationUpdate(null, "unavailable");
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

/** Listens for clicks on the map background (not markers) to deselect. */
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

/** Programmatic map controller — handles recenter trigger. */
function MapController({
  userLocation,
  recenterTrigger,
}: {
  userLocation: [number, number] | null;
  recenterTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (recenterTrigger > 0 && userLocation) {
      map.flyTo(userLocation, 15, { duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterTrigger]);

  return null;
}

// ─── Main MapView component ────────────────────────────────────────────────────

interface MapViewProps {
  unlockedSpots: string[];
  userLocation: [number, number] | null;
  selectedSpotId: string | null;
  recenterTrigger: number;
  onMarkerClick: (spotId: string) => void;
  onMapClick: () => void;
  onLocationUpdate: (loc: [number, number] | null, status: LocationStatus) => void;
}

export default function MapView({
  unlockedSpots,
  userLocation,
  selectedSpotId,
  recenterTrigger,
  onMarkerClick,
  onMapClick,
  onLocationUpdate,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl animate-bounce">🗺️</div>
          <p className="text-stpat-green/40 text-sm font-medium">
            Loading map…
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[41.886, -87.62]}
      zoom={13}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      {/* Dark-styled CARTO tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />

      {/* Controllers */}
      <MapController
        userLocation={userLocation}
        recenterTrigger={recenterTrigger}
      />
      <MapClickHandler onMapClick={onMapClick} />

      {/* User location marker */}
      <UserLocationMarker onLocationUpdate={onLocationUpdate} />

      {/* Quest spot markers */}
      {SPOTS.map((spot) => {
        const isUnlocked = unlockedSpots.includes(spot.id);
        const isSelected = selectedSpotId === spot.id;
        const markerState: "locked" | "unlocked" | "selected" = isSelected
          ? "selected"
          : isUnlocked
          ? "unlocked"
          : "locked";

        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createSpotIcon(spot.emoji, markerState)}
            eventHandlers={{
              click: (e) => {
                // Stop map click from also firing
                L.DomEvent.stopPropagation(e);
                onMarkerClick(spot.id);
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
