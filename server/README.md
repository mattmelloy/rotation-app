# Backend Server for The Rotation

This Express backend provides secure API endpoints for Gemini AI operations, keeping your API key safe from client-side exposure.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Make sure your root `.env` file contains:
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## API Endpoints

All endpoints are prefixed with `/api/ai`:

### POST /api/ai/parse-image
Parse a recipe from an image (base64 encoded).

**Request body:**
```json
{
  "base64Image": "base64-encoded-image-string",
  "includeThermomix": false
}
```

### POST /api/ai/generate-recipe
Generate a recipe from text or URL.

**Request body:**
```json
{
  "text": "recipe name or URL",
  "isUrl": false,
  "includeThermomix": false
}
```

### POST /api/ai/edit-recipe
Edit an existing recipe with AI instructions.

**Request body:**
```json
{
  "currentMeal": { /* Meal object */ },
  "instruction": "make it vegetarian"
}
```

### POST /api/ai/thermomix-method
Generate Thermomix-specific cooking steps.

**Request body:**
```json
{
  "currentMeal": { /* Meal object */ }
}
```

## Production Build

```bash
npm run build
npm start
```

## CORS Configuration

The server allows requests from `http://localhost:5173` by default. For production, update the `FRONTEND_URL` environment variable to your production frontend URL.
