import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackCaption } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { spotId, prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Return fallback when no API key
      return Response.json({
        imageBase64: null,
        caption: getFallbackCaption(spotId),
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try gemini-2.0-flash-exp for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      } as never,
    });

    const result = await model.generateContent([
      prompt + " High quality, festive, shareable postcard format. 1:1 ratio.",
    ]);

    let imageBase64: string | null = null;
    let caption = "";

    const candidate = result.response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if ("inlineData" in part && part.inlineData) {
          imageBase64 = part.inlineData.data;
        } else if ("text" in part && part.text) {
          caption = part.text;
        }
      }
    }

    if (!caption) {
      caption = getFallbackCaption(spotId);
    }

    return Response.json({ imageBase64, caption });
  } catch (error) {
    console.error("Gemini API error:", error);

    // Fallback: try text-only generation
    try {
      const { spotId } = await req.json().catch(() => ({ spotId: "unknown" }));
      return Response.json({
        imageBase64: null,
        caption: getFallbackCaption(spotId),
      });
    } catch {
      return Response.json({
        imageBase64: null,
        caption: "Chicago welcomes its newest legend! 🍀",
      });
    }
  }
}
