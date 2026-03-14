import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDefaultPrompt, getFallbackCaption } from "@/lib/gemini";

export async function POST(req: Request) {
  let spotId = "unknown";

  try {
    const body = await req.json();
    spotId = body.spotId;
    const prompt = body.prompt;
  let payload: { spotId?: string; spotName?: string; prompt?: string } = {};

  try {
    payload = (await req.json()) as {
      spotId?: string;
      spotName?: string;
      prompt?: string;
    };
    const prompt = payload.prompt || getDefaultPrompt(payload.spotName);

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        imageBase64: null,
        caption: getFallbackCaption(payload.spotName),
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
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
      caption = getFallbackCaption(payload.spotName);
    }

    return Response.json({ imageBase64, caption });
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json({
      imageBase64: null,
      caption: getFallbackCaption(spotId),

    return Response.json({
      imageBase64: null,
      caption: getFallbackCaption(payload.spotName),
    });
  }
}
