import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentMeal } = req.body;
    
    if (!currentMeal) {
      return res.status(400).json({ error: 'currentMeal is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Here is a recipe:
      Title: ${currentMeal.title}
      Ingredients: ${JSON.stringify(currentMeal.ingredients)}
      Method: ${JSON.stringify(currentMeal.method)}

      Please generate a 'thermomixMethod' array for this recipe.
      If it can be cooked entirely in a kitchen robot (stews, soups, doughs), provide the full procedure with Speed, Temperature, and Time settings.
      If the recipe is for something like a BBQ steak or Pizza, focus the Thermomix steps on the preparation (chopping veg, making the dough, blending the sauce) and label it as 'Prep Only'.
      Return ONLY the array of strings for the steps.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ steps: data.steps || [] });
  } catch (error: any) {
    console.error("AI Thermomix Gen Error:", error);
    res.status(500).json({ error: 'Failed to generate Thermomix steps', message: error.message });
  }
}
