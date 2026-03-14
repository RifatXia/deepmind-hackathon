export type SpotTier = "bronze" | "silver" | "gold";

export interface Spot {
  id: string;
  name: string;
  emoji: string;
  description: string;
  lat: number;
  lng: number;
  points: number;
  radius: number; // meters
  badge: string;
  tier: SpotTier;
  geminiPrompt: string;
  funFact: string;
}

export interface SpotSource {
  type: "node" | "way" | "relation";
  id: number;
  name: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

export interface LandmarksResponse {
  spots: Spot[];
  fetchedAt: string;
}

function toTitleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getCategory(tags: Record<string, string>): string {
  if (tags["man_made"] === "tower") return "tower";
  if (tags.tourism === "museum") return "museum";
  if (tags.tourism === "gallery") return "gallery";
  if (tags.tourism === "zoo") return "zoo";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.tourism === "attraction") return "attraction";
  if (tags.historic === "monument") return "monument";
  if (tags.historic === "memorial") return "memorial";
  if (tags.historic === "building") return "historic building";
  if (tags.tourism) return tags.tourism;
  if (tags.historic) return tags.historic;
  return "landmark";
}

function getEmoji(category: string): string {
  if (category === "tower") return "🏙️";
  if (category === "museum") return "🖼️";
  if (category === "gallery") return "🎨";
  if (category === "zoo") return "🐾";
  if (category === "viewpoint") return "🌆";
  if (category === "monument") return "🏛️";
  if (category === "memorial") return "🕯️";
  if (category === "historic building") return "🏛️";
  return "📍";
}

function getTierForRank(rank: number): SpotTier {
  if (rank < 2) return "gold";
  if (rank < 7) return "silver";
  return "bronze";
}

function getPointsForTier(tier: SpotTier): number {
  if (tier === "gold") return 300;
  if (tier === "silver") return 220;
  return 150;
}

function getRadiusForTier(tier: SpotTier): number {
  if (tier === "gold") return 150;
  if (tier === "silver") return 180;
  return 220;
}

export function buildSpotFromSource(source: SpotSource, rank: number): Spot {
  const category = getCategory(source.tags);
  const categoryLabel = toTitleCase(category);
  const emoji = getEmoji(category);
  const tier = getTierForRank(rank);
  const points = getPointsForTier(tier);
  const radius = getRadiusForTier(tier);

  return {
    id: `osm-${source.type}-${source.id}`,
    name: source.name,
    emoji,
    description: `A Chicago ${category} worth exploring in person.`,
    lat: source.lat,
    lng: source.lng,
    points,
    radius,
    badge: `${categoryLabel} Scout ${emoji}`,
    tier,
    funFact: `${source.name} is tagged in OpenStreetMap as a ${category}.`,
    geminiPrompt: `Create a vibrant St. Patrick's Day postcard of ${source.name} in Chicago. Highlight the location's ${category} character with festive green accents, shamrocks, and a celebratory travel vibe. High quality, shareable postcard format.`,
  };
}
