import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LuckyQuestData {
  title: string;
  description: string;
  rewardXP: number;
  locationHint: string;
}

// Fallback pool when AI is unavailable
const FALLBACK_QUESTS: LuckyQuestData[] = [
  {
    title: "Lucky River Walk",
    description:
      "Stroll along the Chicago River and photograph something green — a building, a jacket, or the river itself on dye day!",
    rewardXP: 110,
    locationHint: "Chicago Riverwalk",
  },
  {
    title: "Bean Seeker's Challenge",
    description:
      "Find Cloud Gate in Millennium Park and count how many shamrock decorations you can spot within 50 feet.",
    rewardXP: 120,
    locationHint: "Millennium Park",
  },
  {
    title: "Navy Pier Lucky Spin",
    description:
      "Head to Navy Pier and spot someone wearing full green. Bonus points if it's a leprechaun hat!",
    rewardXP: 90,
    locationHint: "Navy Pier",
  },
  {
    title: "Willis Tower Sky Dare",
    description:
      "Visit the Willis Tower Skydeck and wave at the clouds while wearing or holding something green.",
    rewardXP: 150,
    locationHint: "Willis Tower Skydeck",
  },
  {
    title: "Art Lion Hunt",
    description:
      "Find the famous lion statues at the Art Institute and decide which one looks more festive for St. Patrick's Day.",
    rewardXP: 80,
    locationHint: "Art Institute of Chicago",
  },
];

const PROMPT = `Generate a fun micro quest for a tourist exploring Chicago during St. Patrick's Day.

The quest should:
- be short and playful
- involve exploring Chicago landmarks or the famous green river
- be easy to complete on foot
- include a reward XP value between 50 and 150
- reference Chicago culture or St. Patrick's Day traditions

Return ONLY valid JSON in this exact format, with no markdown fences or extra text:
{
  "title": "...",
  "description": "...",
  "rewardXP": number,
  "locationHint": "..."
}`;

function randomFallback(): LuckyQuestData {
  return FALLBACK_QUESTS[Math.floor(Math.random() * FALLBACK_QUESTS.length)];
}

function parseQuest(text: string): LuckyQuestData | null {
  try {
    // Strip markdown code fences if the model adds them anyway
    const cleaned = text.replace(/```(?:json)?/gi, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]) as Partial<LuckyQuestData>;
    if (!parsed.title || !parsed.description || !parsed.locationHint) return null;

    return {
      title: String(parsed.title).slice(0, 80),
      description: String(parsed.description).slice(0, 200),
      rewardXP: Math.max(50, Math.min(150, Math.round(Number(parsed.rewardXP) || 100))),
      locationHint: String(parsed.locationHint).slice(0, 60),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(randomFallback());
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 256,
      },
    });

    const result = await model.generateContent(PROMPT);
    const text = result.response.text().trim();
    const quest = parseQuest(text);

    if (!quest) {
      console.warn("Lucky Quest: failed to parse AI response, using fallback");
      return Response.json(randomFallback());
    }

    return Response.json(quest);
  } catch (err) {
    console.error("Lucky Quest generation error:", err);
    return Response.json(randomFallback());
  }
}
