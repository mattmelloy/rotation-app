import { Meal, Effort } from './types';
import { determineProtein } from './utils';

// Use relative /api routes - works with both Vercel serverless and local dev
const API_URL = '';

export async function parseRecipeFromImage(base64Image: string, includeThermomix: boolean = false): Promise<Partial<Meal>> {
  try {
    const response = await fetch(`${API_URL}/api/ai/parse-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, includeThermomix })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      method: data.method,
      thermomixMethod: data.thermomixMethod,
      effort: data.effort as Effort,
      protein: data.protein || determineProtein(data.title || '')
    };
  } catch (error) {
    console.error("AI Image Parse Error:", error);
    throw new Error("Failed to read recipe from image.");
  }
}

export async function generateRecipeFromText(text: string, isUrl: boolean = false, includeThermomix: boolean = false): Promise<Partial<Meal>> {
  try {
    const response = await fetch(`${API_URL}/api/ai/generate-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, isUrl, includeThermomix })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      method: data.method,
      thermomixMethod: data.thermomixMethod,
      effort: data.effort as Effort,
      protein: data.protein || determineProtein(data.title || '')
    };
  } catch (error) {
    console.error("AI Text Parse Error:", error);
    throw new Error("Failed to generate recipe.");
  }
}

export async function editRecipeWithAI(currentMeal: Partial<Meal>, instruction: string): Promise<Partial<Meal>> {
  try {
    const response = await fetch(`${API_URL}/api/ai/edit-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentMeal, instruction })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      method: data.method,
      thermomixMethod: data.thermomixMethod,
      effort: data.effort as Effort,
      protein: data.protein || determineProtein(data.title || '')
    };
  } catch (error) {
    console.error("AI Edit Error:", error);
    throw new Error("Failed to edit recipe.");
  }
}

export async function generateThermomixMethod(currentMeal: Partial<Meal>): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/ai/thermomix-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentMeal })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.steps || [];
  } catch (error) {
    console.error("AI Thermomix Gen Error:", error);
    throw new Error("Failed to generate Thermomix steps.");
  }
}
