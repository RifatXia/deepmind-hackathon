export interface ArtStyle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompt: string;
  preview: string; // CSS gradient as visual preview
}

export const ART_STYLES: ArtStyle[] = [
  {
    id: "picasso",
    name: "Picasso Cubism",
    emoji: "🎭",
    description: "Abstract geometric shapes, multiple perspectives",
    prompt:
      "Transform this photo into Pablo Picasso's Cubist style — fragmented geometric shapes, multiple simultaneous viewpoints, bold outlines, muted earth tones mixed with bright blues and greens. The subjects should be recognizable but abstracted into angular planes.",
    preview: "linear-gradient(135deg, #4a6741, #8b7355, #5b8a72, #c49a6c)",
  },
  {
    id: "vangogh",
    name: "Van Gogh Swirls",
    emoji: "🌻",
    description: "Swirling brushstrokes, vivid starry night vibes",
    prompt:
      "Transform this photo into Vincent van Gogh's Post-Impressionist style — thick impasto swirling brushstrokes, vibrant yellows and blues, dramatic movement in the sky and background like Starry Night. Rich, emotional, textured oil painting feel.",
    preview: "linear-gradient(135deg, #1a237e, #ffd54f, #2e7d32, #1565c0)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    emoji: "🌃",
    description: "Neon lights, futuristic dystopian vibes",
    prompt:
      "Transform this photo into a cyberpunk aesthetic — neon pink, electric blue, and toxic green lighting, rain-slicked reflections, holographic overlays, futuristic HUD elements, glitch effects. Make the Chicago architecture look like it's from Blade Runner 2049.",
    preview: "linear-gradient(135deg, #0d0221, #ff00ff, #00ffff, #0d0221)",
  },
  {
    id: "artdeco",
    name: "Art Deco Gold",
    emoji: "✨",
    description: "1920s Chicago elegance, gold leaf geometric",
    prompt:
      "Transform this photo into a luxurious 1920s Art Deco style — gold leaf patterns, geometric symmetry, elegant lines, rich blacks and golds reminiscent of the Roaring Twenties and Chicago's golden age. Think Great Gatsby meets Chicago architecture.",
    preview: "linear-gradient(135deg, #1a1a2e, #d4af37, #2d2d44, #ffd700)",
  },
  {
    id: "cartoon",
    name: "Chicago Cartoon",
    emoji: "🎨",
    description: "Fun cartoon/comic style with Chicago flair",
    prompt:
      "Transform this photo into a fun, colorful cartoon/comic book style — bold black outlines, flat vibrant colors, exaggerated features, speech bubbles, halftone dots. Make the subjects look like characters in a Chicago-themed comic strip. Playful and shareable.",
    preview: "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)",
  },
  {
    id: "stpats",
    name: "St. Pat's Magic",
    emoji: "🍀",
    description: "Enchanted Irish fantasy with shamrocks & gold",
    prompt:
      "Transform this photo into a magical St. Patrick's Day fantasy scene — enchanted forest vibes, glowing shamrocks, pots of gold, rainbow arcs, emerald green atmosphere, leprechaun sparkle dust, Celtic knot borders. The subjects should look like they've stepped into a magical Irish wonderland in Chicago.",
    preview: "linear-gradient(135deg, #14532d, #22c55e, #ca8a04, #16a34a)",
  },
];
