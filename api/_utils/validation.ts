import type { VercelRequest } from '@vercel/node';

// Input validation and sanitization utilities

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedValue?: any;
}

// Maximum lengths for different input types
const MAX_LENGTHS = {
  text: 5000,        // General text input
  message: 2000,     // Chat message
  recipeName: 200,   // Recipe name
  url: 2048,         // URL length
  instructions: 10000, // Recipe instructions
  ingredients: 5000,   // Ingredients list
};

// Sanitize string input by removing potentially dangerous content
export function sanitizeString(input: string, maxLength: number = MAX_LENGTHS.text): string {
  if (typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength) // Enforce max length
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize chat messages
export function validateMessages(messages: any[]): ValidationResult {
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }

  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages in conversation history' };
  }

  const sanitizedMessages = messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      return null;
    }

    const role = msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user';
    const text = typeof msg.text === 'string' 
      ? sanitizeString(msg.text, MAX_LENGTHS.message)
      : '';

    if (!text) {
      return null;
    }

    return { role, text };
  }).filter(Boolean);

  if (sanitizedMessages.length === 0) {
    return { valid: false, error: 'No valid messages provided' };
  }

  return { valid: true, sanitizedValue: sanitizedMessages };
}

// Validate recipe generation input
export function validateRecipeInput(body: any): ValidationResult {
  const { text, isUrl = false, includeThermomix = false } = body;

  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Recipe text or URL is required' };
  }

  const sanitizedText = sanitizeString(text, isUrl ? MAX_LENGTHS.url : MAX_LENGTHS.recipeName);
  
  if (!sanitizedText) {
    return { valid: false, error: 'Invalid recipe input' };
  }

  return {
    valid: true,
    sanitizedValue: {
      text: sanitizedText,
      isUrl: Boolean(isUrl),
      includeThermomix: Boolean(includeThermomix)
    }
  };
}

// Validate recipe edit input
export function validateEditInput(body: any): ValidationResult {
  const { recipe, editRequest } = body;

  if (!recipe || typeof recipe !== 'object') {
    return { valid: false, error: 'Recipe object is required' };
  }

  if (!editRequest || typeof editRequest !== 'string') {
    return { valid: false, error: 'Edit request is required' };
  }

  const sanitizedEditRequest = sanitizeString(editRequest, MAX_LENGTHS.text);
  
  if (!sanitizedEditRequest) {
    return { valid: false, error: 'Invalid edit request' };
  }

  // Validate recipe structure
  const sanitizedRecipe = {
    name: sanitizeString(recipe.name || '', MAX_LENGTHS.recipeName),
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map((i: string) => sanitizeString(i, 500)).filter(Boolean)
      : [],
    instructions: sanitizeString(recipe.instructions || '', MAX_LENGTHS.instructions),
    prepTime: sanitizeString(recipe.prepTime || '', 50),
    cookTime: sanitizeString(recipe.cookTime || '', 50),
    servings: sanitizeString(recipe.servings || '', 50),
  };

  return {
    valid: true,
    sanitizedValue: {
      recipe: sanitizedRecipe,
      editRequest: sanitizedEditRequest
    }
  };
}

// Validate image parse input (base64)
export function validateImageInput(body: any): ValidationResult {
  const { imageBase64, mimeType } = body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Image data is required' };
  }

  // Check for valid base64 format (rough check)
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  if (!base64Regex.test(cleanBase64.slice(0, 100))) {
    return { valid: false, error: 'Invalid image format' };
  }

  // Limit image size (roughly 10MB base64)
  if (cleanBase64.length > 14_000_000) {
    return { valid: false, error: 'Image too large. Maximum size is 10MB' };
  }

  // Validate mime type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const sanitizedMimeType = allowedMimeTypes.includes(mimeType) ? mimeType : 'image/jpeg';

  return {
    valid: true,
    sanitizedValue: {
      imageBase64: cleanBase64,
      mimeType: sanitizedMimeType
    }
  };
}

// Validate Thermomix method input
export function validateThermomixInput(body: any): ValidationResult {
  const { recipe } = body;

  if (!recipe || typeof recipe !== 'object') {
    return { valid: false, error: 'Recipe object is required' };
  }

  const sanitizedRecipe = {
    name: sanitizeString(recipe.name || '', MAX_LENGTHS.recipeName),
    ingredients: Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map((i: string) => sanitizeString(i, 500)).filter(Boolean)
      : [],
    instructions: sanitizeString(recipe.instructions || '', MAX_LENGTHS.instructions),
  };

  if (!sanitizedRecipe.name && sanitizedRecipe.ingredients.length === 0) {
    return { valid: false, error: 'Recipe must have a name or ingredients' };
  }

  return { valid: true, sanitizedValue: { recipe: sanitizedRecipe } };
}

// Generic request body validator
export function validateRequestBody(
  req: VercelRequest,
  validators: Record<string, (value: any) => ValidationResult>
): ValidationResult {
  const body = req.body;
  const sanitizedBody: Record<string, any> = {};
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(validators)) {
    const result = validator(body[field]);
    if (!result.valid) {
      errors.push(`${field}: ${result.error}`);
    } else if (result.sanitizedValue !== undefined) {
      sanitizedBody[field] = result.sanitizedValue;
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return { valid: true, sanitizedValue: sanitizedBody };
}