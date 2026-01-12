import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // System prompt
    const systemPrompt = `
      You are an expert AI Chef assistant.
      Your goal is to help users with cooking questions, recipe ideas, ingredient substitutions, and meal planning.
      
      STRICT RULES:
      1. You MUST ONLY answer questions related to food, cooking, recipes, kitchen techniques, and meal planning.
      2. If a user asks about non-food topics (politics, coding, general news, etc.), politely decline and steer them back to cooking (e.g., "I'm just a chef, let's stick to the kitchen!").
      3. Do NOT generate images.
      4. Keep answers concise, friendly, and helpful.
    `;

    // Construct history
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

    const text = response.text;
    
    if (!text) {
        throw new Error("No response text received from AI");
    }

    res.json({ text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: 'Failed to generate chat response', message: error.message });
  }
}
