import { SPOTS } from "./spots";

const FALLBACK_CAPTIONS: Record<string, string> = {
  bean: "You stood beneath the silver orb — Chicago salutes you! 🫘🍀",
  riverwalk:
    "You walked the green river — a St. Pat's legend is born! 🌊☘️",
  "wrigley-field":
    "Wrigley's brick walls whispered your name. Cubs fan forever! ⚾🍀",
  "navy-pier": "The Ferris wheel spun just for you, explorer! 🎡✨",
  "willis-tower": "You touched the sky. Chicago is yours. 🏙️👑",
  "art-institute": "Culture unlocked. The lions bow to thee! 🎨🦁",
};

export function getFallbackCaption(spotId: string): string {
  return (
    FALLBACK_CAPTIONS[spotId] || "Chicago welcomes its newest legend! 🍀"
  );
}

export function getSpotPrompt(spotId: string): string {
  const spot = SPOTS.find((s) => s.id === spotId);
  return spot
    ? spot.geminiPrompt +
        " High quality, festive, shareable postcard format. 1:1 ratio."
    : "A beautiful St. Patrick's Day postcard of Chicago. Festive, green, vibrant.";
}
