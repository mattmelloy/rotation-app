import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

// Function to get Gemini client (lazy initialization)
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({ apiKey });
}

// Schema for structured recipe data
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

// POST /api/ai/parse-image
router.post('/parse-image', async (req, res) => {
  try {
    const { base64Image, includeThermomix = false } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const thermomixInstruction = includeThermomix 
      ? "Additionally, create a parallel 'thermomixMethod' array. Analyze the recipe: if it can be cooked entirely in a Thermomix (like a risotto or soup), provide full steps with speed/temp/time. If it involves baking or grilling, provide Thermomix steps for the preparation (chopping, grating, sauces, dough) and note the remainder."
      : "Do not include a thermomixMethod.";

    const ai = getAI();
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
});

// POST /api/ai/generate-recipe
router.post('/generate-recipe', async (req, res) => {
  try {
    const { text, isUrl = false, includeThermomix = false } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const thermomixInstruction = includeThermomix 
      ? "Additionally, generate a parallel 'thermomixMethod' array. Analyze the recipe: if it can be cooked entirely in a kitchen robot (stews, soups, doughs), provide the full procedure with Speed, Temperature, and Time settings. If the recipe is for something like a BBQ steak or Pizza, focus the Thermomix steps on the preparation (chopping veg, making the dough, blending the sauce) and label it as 'Prep Only'."
      : "Do not include a thermomixMethod.";

    const prompt = isUrl 
      ? `Find or generate a recipe for this URL/Title: ${text}. Extract title, description, ingredients, and method. ${thermomixInstruction}`
      : `Extract recipe details from this text: ${text}. ${thermomixInstruction}`;

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: recipeSchema
    };

    if (isUrl) {
      config.tools = [{ googleSearch: {} }];
    }

    const ai = getAI();
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
});

// POST /api/ai/edit-recipe
router.post('/edit-recipe', async (req, res) => {
  try {
    const { currentMeal, instruction } = req.body;
    
    if (!currentMeal || !instruction) {
      return res.status(400).json({ error: 'currentMeal and instruction are required' });
    }

    const prompt = `
      Here is a current recipe JSON:
      ${JSON.stringify(currentMeal, null, 2)}

      Please modify this recipe according to the following instruction: "${instruction}".
      Return the updated recipe JSON using the same schema. 
      Maintain any fields that don't need changing, but feel free to update title, ingredients, method, description, effort, or protein if the instruction implies it.
    `;

    const ai = getAI();
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
});

// POST /api/ai/thermomix-method
router.post('/thermomix-method', async (req, res) => {
  try {
    const { currentMeal } = req.body;
    
    if (!currentMeal) {
      return res.status(400).json({ error: 'currentMeal is required' });
    }

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

    const ai = getAI();
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
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // System prompt to enforce persona
    const systemPrompt = `
      You are an expert AI Chef assistant.
      Your goal is to help users with cooking questions, recipe ideas, ingredient substitutions, and meal planning.
      
      STRICT RULES:
      1. You MUST ONLY answer questions related to food, cooking, recipes, kitchen techniques, and meal planning.
      2. If a user asks about non-food topics (politics, coding, general news, etc.), politely decline and steer them back to cooking (e.g., "I'm just a chef, let's stick to the kitchen!").
      3. Do NOT generate images.
      4. Keep answers concise, friendly, and helpful.
    `;

    const ai = getAI();
    
    // Construct the chat history with system prompt
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood, Chef! I am ready to help with all things cooking. What's on the menu?" }]
      }
    ];

    // Add all messages from the conversation (including the latest one)
    if (messages.length > 0) {
      const userMessages = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push(...userMessages);
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents
    });

    // In this SDK version, response.text seems to be a string property
    const text = response.text;
    
    if (!text) {
        throw new Error("No response text received from AI");
    }

    res.json({ text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: 'Failed to generate chat response', message: error.message });
  }
});

export default router;
