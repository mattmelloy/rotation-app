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
    const { currentMeal, instruction } = req.body;
    
    if (!currentMeal || !instruction) {
      return res.status(400).json({ error: 'currentMeal and instruction are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Here is a current recipe JSON:
      ${JSON.stringify(currentMeal, null, 2)}

      Please modify this recipe according to the following instruction: "${instruction}".
      Return the updated recipe JSON using the same schema. 
      Maintain any fields that don't need changing, but feel free to update title, ingredients, method, description, effort, or protein if the instruction implies it.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.error("AI Edit Error:", error);
    res.status(500).json({ error: 'Failed to edit recipe', message: error.message });
  }
}
