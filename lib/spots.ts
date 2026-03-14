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

// ── Curated iconic Chicago landmarks ──────────────────────────────────
export const CURATED_SPOTS: Spot[] = [
  {
    id: "cloud-gate",
    name: "Cloud Gate (The Bean)",
    emoji: "🫘",
    description: "Anish Kapoor's iconic reflective sculpture in Millennium Park",
    lat: 41.8827,
    lng: -87.6233,
    points: 300,
    radius: 150,
    badge: "Bean Selfie Master 🫘",
    tier: "gold",
    funFact:
      "Cloud Gate is made of 168 stainless steel plates welded together — the seams were polished so you can't see any joints!",
    geminiPrompt:
      "Create a vibrant St. Patrick's Day postcard of Cloud Gate (The Bean) in Millennium Park, Chicago. Show the reflective sculpture with a green-tinted Chicago skyline, shamrocks, and festive energy.",
  },
  {
    id: "willis-tower",
    name: "Willis Tower (Sears Tower)",
    emoji: "🏙️",
    description: "Chicago's tallest building with the famous Skydeck glass ledge",
    lat: 41.8789,
    lng: -87.6359,
    points: 300,
    radius: 150,
    badge: "Sky High Legend 🏙️",
    tier: "gold",
    funFact:
      "Willis Tower was the world's tallest building for 25 years (1973-1998). The Skydeck ledge extends 4 feet out from the 103rd floor!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Willis Tower (Sears Tower) in Chicago. Show the iconic skyscraper against a dramatic sky with green lights, shamrocks, and celebratory vibes.",
  },
  {
    id: "navy-pier",
    name: "Navy Pier",
    emoji: "🎡",
    description: "Chicago's iconic lakefront destination with the famous Ferris wheel",
    lat: 41.8917,
    lng: -87.6086,
    points: 220,
    radius: 200,
    badge: "Pier Explorer 🎡",
    tier: "silver",
    funFact:
      "Navy Pier opened in 1916 and stretches 3,300 feet into Lake Michigan. Its Centennial Wheel stands 196 feet tall!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Navy Pier in Chicago with the Ferris wheel lit up in green, shamrocks, and lakefront celebration vibes.",
  },
  {
    id: "art-institute",
    name: "Art Institute of Chicago",
    emoji: "🎨",
    description: "World-class art museum home to American Gothic and A Sunday on La Grande Jatte",
    lat: 41.8796,
    lng: -87.6237,
    points: 220,
    radius: 180,
    badge: "Art Connoisseur 🎨",
    tier: "silver",
    funFact:
      "The Art Institute's lion statues have stood guard since 1894. They get Chicago sports jerseys during big games!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of the Art Institute of Chicago with its famous lion statues wearing green, shamrocks, and artistic celebration.",
  },
  {
    id: "millennium-park",
    name: "Millennium Park",
    emoji: "🌳",
    description: "Chicago's premier public park with Crown Fountain and Pritzker Pavilion",
    lat: 41.8826,
    lng: -87.6226,
    points: 220,
    radius: 200,
    badge: "Park Pioneer 🌳",
    tier: "silver",
    funFact:
      "Millennium Park was built over old railroad tracks and parking lots. Crown Fountain's video faces spit water at visitors!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Millennium Park in Chicago with Crown Fountain, Pritzker Pavilion, and lush green shamrock-filled scenery.",
  },
  {
    id: "chicago-riverwalk",
    name: "Chicago Riverwalk",
    emoji: "🌊",
    description: "Scenic 1.25-mile pedestrian path along the main branch of the Chicago River",
    lat: 41.8882,
    lng: -87.6218,
    points: 220,
    radius: 250,
    badge: "River Runner 🌊",
    tier: "silver",
    funFact:
      "Every St. Patrick's Day, the Chicago River is dyed bright green using a secret vegetable-based dye formula known only to the plumbers' union!",
    geminiPrompt:
      "Create a vibrant St. Patrick's Day postcard of the Chicago Riverwalk with the river dyed green, bridges, and festive celebration along the waterfront.",
  },
  {
    id: "wrigley-field",
    name: "Wrigley Field",
    emoji: "⚾",
    description: "Historic home of the Chicago Cubs since 1914",
    lat: 41.9484,
    lng: -87.6553,
    points: 220,
    radius: 200,
    badge: "Cubs Fan Scout ⚾",
    tier: "silver",
    funFact:
      "Wrigley Field is the second-oldest MLB ballpark. Its ivy-covered outfield walls were planted in 1937!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Wrigley Field in Chicago with the iconic marquee, ivy walls with shamrocks, and green baseball celebration.",
  },
  {
    id: "magnificent-mile",
    name: "Magnificent Mile",
    emoji: "🛍️",
    description: "Chicago's premier shopping and dining stretch on Michigan Avenue",
    lat: 41.8942,
    lng: -87.6246,
    points: 150,
    radius: 250,
    badge: "Mag Mile Walker 🛍️",
    tier: "bronze",
    funFact:
      "The Magnificent Mile got its name from a 1940s real estate developer. It has over 460 stores in just 13 blocks!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Chicago's Magnificent Mile on Michigan Avenue with shoppers, green decorations, and urban celebration.",
  },
  {
    id: "buckingham-fountain",
    name: "Buckingham Fountain",
    emoji: "⛲",
    description: "One of the largest fountains in the world, in Grant Park",
    lat: 41.8758,
    lng: -87.6189,
    points: 150,
    radius: 180,
    badge: "Fountain Finder ⛲",
    tier: "bronze",
    funFact:
      "Buckingham Fountain shoots water up to 150 feet and holds 1.5 million gallons. On St. Pat's it glows green!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Buckingham Fountain in Chicago's Grant Park with green-lit water jets, shamrocks, and lakefront celebration.",
  },
  {
    id: "field-museum",
    name: "Field Museum",
    emoji: "🦕",
    description: "World-famous natural history museum, home to SUE the T. rex",
    lat: 41.8663,
    lng: -87.6170,
    points: 150,
    radius: 200,
    badge: "Dino Hunter 🦕",
    tier: "bronze",
    funFact:
      "SUE is the largest, most complete T. rex skeleton ever found. She's 42 feet long and 67 million years old!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of the Field Museum in Chicago with SUE the T. rex wearing a shamrock hat, green festive vibes.",
  },
  {
    id: "shedd-aquarium",
    name: "Shedd Aquarium",
    emoji: "🐠",
    description: "One of the world's largest indoor aquariums on the Museum Campus",
    lat: 41.8676,
    lng: -87.6140,
    points: 150,
    radius: 200,
    badge: "Ocean Explorer 🐠",
    tier: "bronze",
    funFact:
      "When Shedd opened in 1930, it was the first inland aquarium with a saltwater collection. Over 32,000 animals live here!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Shedd Aquarium in Chicago with underwater green vibes, marine life, and lakefront celebration.",
  },
  {
    id: "lincoln-park-zoo",
    name: "Lincoln Park Zoo",
    emoji: "🦁",
    description: "One of the oldest free zoos in the US, in the heart of Lincoln Park",
    lat: 41.9211,
    lng: -87.6340,
    points: 150,
    radius: 250,
    badge: "Zoo Adventurer 🦁",
    tier: "bronze",
    funFact:
      "Lincoln Park Zoo has been free since it opened in 1868 — it's one of the last free zoos in the country!",
    geminiPrompt:
      "Create a festive St. Patrick's Day postcard of Lincoln Park Zoo in Chicago with animals, green foliage, shamrocks, and family celebration.",
  },
];

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
