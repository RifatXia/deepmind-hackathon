import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackCaption } from "@/lib/gemini";
import { ART_STYLES } from "@/lib/art-styles";

export const maxDuration = 60;

export async function POST(req: Request) {
  let spotId = "unknown";
  let spotName = "Chicago";
  let styleId = "";

  try {
    const body = await req.json();
    spotId = body.spotId;
    spotName = body.spotName;
    styleId = body.styleId;
    const userImageBase64 = body.userImageBase64;

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({
        imageBase64: null,
        caption: getFallbackCaption(spotId),
        styleName: "AI Generated",
        error: "No API key configured",
      });
    }

    const style = ART_STYLES.find((s) => s.id === styleId);
    if (!style) {
      return Response.json({ error: "Invalid style" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use gemini-2.5-flash-image for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      } as never,
    });

    const prompt = buildStylePrompt(spotName, style.prompt, !!userImageBase64);

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (userImageBase64) {
      const base64Data = userImageBase64.replace(
        /^data:image\/[^;]+;base64,/,
        ""
      );
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    parts.push({ text: prompt });

    console.log(
      `[style-transfer] Generating ${style.name} for ${spotName}, hasImage: ${!!userImageBase64}`
    );

    const result = await model.generateContent(parts);

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
      caption = `Your ${style.name} souvenir from ${spotName}! ${getFallbackCaption(spotId)}`;
    }

    console.log(
      `[style-transfer] Success! Image: ${!!imageBase64}, Caption length: ${caption.length}`
    );

    return Response.json({
      imageBase64,
      caption,
      styleName: style.name,
    });
  } catch (error) {
    console.error("Style transfer error:", error);

    const style = ART_STYLES.find((s) => s.id === styleId);
    return Response.json({
      imageBase64: null,
      caption: `Your ${style?.name || "AI"} souvenir from ${spotName}! ${getFallbackCaption(spotId)}`,
      styleName: style?.name || "AI Generated",
      error: String(error),
    });
  }
}

function buildStylePrompt(
  spotName: string,
  stylePrompt: string,
  hasPhoto: boolean
): string {
  if (hasPhoto) {
    return `You are an artistic AI that transforms photographs into stunning art pieces.

The user is visiting ${spotName} in Chicago during St. Patrick's Day.

Take the provided photo and transform it in this style:
${stylePrompt}

IMPORTANT RULES:
- Keep the people/subjects from the original photo recognizable
- Incorporate the Chicago location and St. Patrick's Day festive elements (green accents, shamrocks, gold highlights)
- Make it look like a premium collectible souvenir postcard
- The output should be a single beautiful image, 1:1 square ratio
- Add a subtle "ChiQuest" watermark text in the bottom corner

Also generate a short fun caption (1-2 sentences) about this Chicago souvenir.`;
  }

  // No photo — generate from scratch
  return `Generate a stunning St. Patrick's Day souvenir postcard for ${spotName} in Chicago.

Art style: ${stylePrompt}

The image should:
- Show the landmark beautifully in this art style
- Include St. Patrick's Day festive elements (green accents, shamrocks, gold highlights)
- Look like a premium collectible souvenir postcard
- Be a single beautiful image, 1:1 square ratio
- Have a subtle "ChiQuest" watermark text in the bottom corner

Also generate a short fun caption (1-2 sentences) about this Chicago souvenir.`;
}
