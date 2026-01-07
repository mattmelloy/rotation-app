import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    method: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    thermomixMethod: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Steps adapted for a Thermomix or similar kitchen robot. If not compatible, list prep steps only."
    },
    effort: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
    protein: { type: Type.STRING }
  },
  required: ['title', 'ingredients', 'method', 'effort', 'protein']
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, includeThermomix = false } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const thermomixInstruction = includeThermomix 
      ? "Additionally, create a parallel 'thermomixMethod' array. Analyze the recipe: if it can be cooked entirely in a Thermomix (like a risotto or soup), provide full steps with speed/temp/time. If it involves baking or grilling, provide Thermomix steps for the preparation (chopping, grating, sauces, dough) and note the remainder."
      : "Do not include a thermomixMethod.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this image. If it's a recipe, extract the title, description (brief), ingredients, and method steps. Estimate the effort level and main protein. ${thermomixInstruction}`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.error("AI Image Parse Error:", error);
    res.status(500).json({ error: 'Failed to read recipe from image', message: error.message });
  }
}
