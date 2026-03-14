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
  tier: "bronze" | "silver" | "gold";
  geminiPrompt: string;
  funFact: string;
}

export const SPOTS: Spot[] = [
  {
    id: "bean",
    name: "Cloud Gate (The Bean)",
    emoji: "🫘",
    description:
      "Chicago's most iconic landmark — the mirrored bean in Millennium Park.",
    lat: 41.8827,
    lng: -87.6233,
    points: 200,
    radius: 150,
    badge: "Bean Seeker 🫘",
    tier: "bronze",
    funFact:
      "The Bean weighs 110 tons and has no visible seams despite being made of 168 steel plates!",
    geminiPrompt:
      "Create a vibrant St. Patrick's Day postcard of Cloud Gate (The Bean) in Chicago's Millennium Park, with green shamrocks, festive lighting, and a tourist celebrating. Watercolor style, joyful.",
  },
  {
    id: "riverwalk",
    name: "Chicago Riverwalk",
    emoji: "🌊",
    description: "The famous river dyed green every St. Patrick's Day.",
    lat: 41.8876,
    lng: -87.627,
    points: 150,
    radius: 200,
    badge: "River Walker 🌊",
    tier: "bronze",
    funFact:
      "The Chicago River has been dyed green for St. Patrick's Day since 1962 using an orange powder that turns green on contact with water!",
    geminiPrompt:
      "A St. Patrick's Day postcard of the Chicago River dyed bright green, with boats and cheering crowds, shamrocks floating. Vibrant digital art style.",
  },
  {
    id: "wrigley-field",
    name: "Wrigley Field",
    emoji: "⚾",
    description: "Home of the Chicago Cubs — a shrine for sports lovers.",
    lat: 41.9484,
    lng: -87.6553,
    points: 250,
    radius: 200,
    badge: "Cubbie Fan ⚾",
    tier: "silver",
    funFact:
      "Wrigley Field is the second-oldest MLB ballpark (1914) and didn't have lights for night games until 1988!",
    geminiPrompt:
      "A whimsical St. Patrick's Day postcard of Wrigley Field in Chicago at sunset, with green ivy on the brick walls, shamrocks everywhere, leprechaun in a Cubs hat. Illustrated style.",
  },
  {
    id: "navy-pier",
    name: "Navy Pier",
    emoji: "🎡",
    description: "The iconic Ferris wheel on Lake Michigan.",
    lat: 41.8919,
    lng: -87.6051,
    points: 200,
    radius: 200,
    badge: "Pier Pioneer 🎡",
    tier: "silver",
    funFact:
      "Navy Pier's Centennial Wheel stands 196 feet tall and offers views of four states on a clear day!",
    geminiPrompt:
      "Festive St. Patrick's Day postcard of Navy Pier Chicago with a Ferris wheel glowing green against twilight, fireworks, Lake Michigan shimmering. Dreamy illustration.",
  },
  {
    id: "willis-tower",
    name: "Willis Tower Skydeck",
    emoji: "🏙️",
    description: "Stand 1,353 feet above the city in the glass ledge.",
    lat: 41.8789,
    lng: -87.6359,
    points: 300,
    radius: 150,
    badge: "Sky Conqueror 🏙️",
    tier: "gold",
    funFact:
      "The Willis Tower Skydeck's glass ledge extends 4.3 feet out from the building — you can look straight down 1,353 feet!",
    geminiPrompt:
      "An epic St. Patrick's Day postcard from the top of Willis Tower Chicago — green shamrock confetti falling over the skyline at dusk. Cinematic, awe-inspiring.",
  },
  {
    id: "art-institute",
    name: "Art Institute of Chicago",
    emoji: "🎨",
    description: "World-class art museum on Michigan Avenue.",
    lat: 41.8796,
    lng: -87.6237,
    points: 200,
    radius: 150,
    badge: "Culture Vulture 🎨",
    tier: "silver",
    funFact:
      "The Art Institute's lion statues have been 'dressed up' for Chicago sports victories since 1994!",
    geminiPrompt:
      "A charming St. Patrick's Day postcard of the Art Institute of Chicago lion statues wearing tiny green hats, shamrocks around the entrance. Playful watercolor.",
  },
];

export function getSpotById(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}
