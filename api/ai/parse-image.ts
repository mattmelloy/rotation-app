import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { strictRateLimiter } from '../_utils/rateLimit';
import { validateImageInput } from '../_utils/validation';

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

  // Rate limiting check (stricter for image processing - more expensive)
  const rateCheck = strictRateLimiter(req, res);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Please wait before processing more images.',
      retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
    });
  }

  try {
    // Input validation and sanitization
    const validation = validateImageInput({
      imageBase64: req.body.base64Image,
      mimeType: req.body.mimeType
    });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { imageBase64, mimeType } = validation.sanitizedValue;
    const includeThermomix = Boolean(req.body.includeThermomix);

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
              mimeType: mimeType,
              data: imageBase64
            }
          },
          {
            text: `Analyze this image. If it's a recipe, extract the title (Ensure Title Case, do NOT use ALL CAPS), description (brief), ingredients, and method steps. Estimate the effort level and main protein. ${thermomixInstruction}`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Safety check: Fix ALL CAPS titles if AI misses the instruction
    if (data.title && data.title === data.title.toUpperCase() && /[a-zA-Z]/.test(data.title)) {
        data.title = data.title.replace(
            /\w\S*/g,
            (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    res.json(data);
  } catch (error: any) {
    console.error("AI Image Parse Error:", error);
    res.status(500).json({ error: 'Failed to read recipe from image', message: error.message });
  }
}
