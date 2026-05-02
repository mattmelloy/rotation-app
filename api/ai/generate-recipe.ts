import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { aiRateLimiter } from '../_utils/rateLimit';
import { validateRecipeInput, sanitizeString } from '../_utils/validation';

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

  // Rate limiting check
  const rateCheck = aiRateLimiter(req, res);
  if (!rateCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Please wait a moment before generating more recipes.',
      retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
    });
  }

  try {
    // Input validation and sanitization
    const validation = validateRecipeInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { text, isUrl, includeThermomix } = validation.sanitizedValue;
    const additionalDetails = sanitizeString(req.body.additionalDetails || '', 500);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const thermomixInstruction = includeThermomix 
      ? "Additionally, generate a parallel 'thermomixMethod' array. Analyze the recipe: if it can be cooked entirely in a kitchen robot (stews, soups, doughs), provide the full procedure with Speed, Temperature, and Time settings. If the recipe is for something like a BBQ steak or Pizza, focus the Thermomix steps on the preparation (chopping veg, making the dough, blending the sauce) and label it as 'Prep Only'."
      : "Do not include a thermomixMethod.";

    const prompt = isUrl 
      ? `Find or generate a recipe for this URL/Title: ${text}. ${additionalDetails ? `Additional User Instructions: ${additionalDetails}.` : ''} Extract title, description, ingredients, and method. ${thermomixInstruction}`
      : `Extract recipe details from this text: ${text}. ${additionalDetails ? `Additional User Instructions: ${additionalDetails}.` : ''} ${thermomixInstruction}`;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: recipeSchema
    };

    if (isUrl) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: config
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.error("AI Text Parse Error:", error);
    res.status(500).json({ error: 'Failed to generate recipe', message: error.message });
  }
}
