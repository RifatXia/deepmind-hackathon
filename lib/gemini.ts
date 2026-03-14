export function getFallbackCaption(spotName?: string): string {
  if (spotName && spotName.trim().length > 0) {
    return `You explored ${spotName} and unlocked another Chicago adventure! 🍀`;
  }
  return "Chicago welcomes its newest legend! 🍀";
}

export function getDefaultPrompt(spotName?: string): string {
  if (spotName && spotName.trim().length > 0) {
    return `Create a festive St. Patrick's Day postcard of ${spotName} in Chicago. Keep it vibrant, celebratory, and postcard-friendly.`;
  }
  return "Create a beautiful St. Patrick's Day postcard of Chicago with festive green energy and a travel postcard look.";
}
