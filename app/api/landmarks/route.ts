import { NextResponse } from "next/server";
import { buildSpotFromSource, type Spot, type SpotSource } from "@/lib/spots";

export const dynamic = "force-dynamic";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MAX_SPOTS = 12;

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface RankedSpotSource extends SpotSource {
  priority: number;
  hasWiki: boolean;
}

function getCoords(element: OverpassElement): { lat: number; lng: number } | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lng: element.lon };
  }
  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  return null;
}

function getPriority(tags: Record<string, string>): number {
  if (tags["man_made"] === "tower") return 100;
  if (tags.tourism === "museum") return 95;
  if (tags.tourism === "gallery") return 92;
  if (tags.tourism === "viewpoint") return 90;
  if (tags.historic === "monument") return 88;
  if (tags.historic === "memorial") return 86;
  if (tags.historic === "building") return 84;
  if (tags.tourism === "attraction") return 82;
  if (tags.tourism === "zoo") return 80;
  return 50;
}

function normalizeElement(element: OverpassElement): RankedSpotSource | null {
  if (!element.tags?.name) return null;
  const coords = getCoords(element);
  if (!coords) return null;

  const tags = element.tags;
  const hasWiki = Boolean(tags.wikidata || tags.wikipedia);

  return {
    type: element.type,
    id: element.id,
    name: tags.name,
    lat: coords.lat,
    lng: coords.lng,
    tags,
    priority: getPriority(tags),
    hasWiki,
  };
}

function dedupeAndRank(elements: OverpassElement[]): RankedSpotSource[] {
  const deduped = new Map<string, RankedSpotSource>();

  for (const element of elements) {
    const normalized = normalizeElement(element);
    if (!normalized) continue;
    const key = `${normalized.type}:${normalized.id}`;
    deduped.set(key, normalized);
  }

  return [...deduped.values()].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (Number(b.hasWiki) !== Number(a.hasWiki)) {
      return Number(b.hasWiki) - Number(a.hasWiki);
    }
    const nameDiff = a.name.localeCompare(b.name);
    if (nameDiff !== 0) return nameDiff;
    return a.id - b.id;
  });
}

const OVERPASS_QUERY = `
[out:json][timeout:25];
area["wikidata"="Q1297"]->.searchArea;
(
  nwr["tourism"~"attraction|museum|viewpoint|gallery|zoo"](area.searchArea);
  nwr["historic"~"monument|memorial|building"](area.searchArea);
  nwr["man_made"="tower"](area.searchArea);
);
out center tags;
`.trim();

export async function GET() {
  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch landmarks from Overpass." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as OverpassResponse;
    const ranked = dedupeAndRank(data.elements ?? []);
    const spots: Spot[] = ranked
      .slice(0, MAX_SPOTS)
      .map((item, index) => buildSpotFromSource(item, index));

    return NextResponse.json({
      spots,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Landmark API error:", error);
    return NextResponse.json(
      { error: "Unable to load Chicago landmarks right now." },
      { status: 502 }
    );
  }
}
