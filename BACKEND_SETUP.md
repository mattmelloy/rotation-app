# Backend API Setup Guide

## Overview

Your Gemini API integration has been secured by moving it to a backend Express server. The API key is now stored server-side and never exposed to the frontend.

## What Was Changed

### 1. **New Backend Server** (`/server` directory)
   - **`server/index.ts`** - Express server with CORS and error handling
   - **`server/routes/ai.ts`** - Four API endpoints that proxy requests to Gemini
   - **`server/package.json`** - Backend dependencies
   - **`server/tsconfig.json`** - TypeScript configuration

### 2. **Updated Frontend** (`ai.ts`)
   - Now makes HTTP requests to your backend instead of calling Gemini directly
   - Uses `fetch()` to call the backend API at `http://localhost:3001`

### 3. **Environment Variables** (`.env`)
   - **`GEMINI_API_KEY`** - Used by backend (secure)
   - **`PORT`** - Backend server port (default: 3001)
   - **`FRONTEND_URL`** - CORS allowed origin (default: http://localhost:5173)
   - ~~`VITE_GEMINI_API_KEY`~~ - DEPRECATED (can be removed once verified)

### 4. **Updated Scripts** (`package.json`)
   - **`npm run dev`** - Start frontend only
   - **`npm run dev:server`** - Start backend only
   - **`npm run dev:all`** - Start both (frontend & backend)
   - **`npm run install:all`** - Install all dependencies

## Getting Started

### First Time Setup

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Update your `.env` file:**
   ```env
   # Your existing keys...
   GEMINI_API_KEY="your-api-key-here"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Start both servers:**
   
   **Option A - Run both together (recommended for development):**
   ```bash
   npm run dev:all
   ```
   
   **Option B - Run separately in different terminals:**
   
   Terminal 1 (Backend):
   ```bash
   npm run dev:server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

4. **Verify it's working:**
   - Backend should be running at: http://localhost:3001
   - Frontend should be running at: http://localhost:5173
   - Test health check: `curl http://localhost:3001/health`

## API Endpoints

All endpoints are prefixed with `/api/ai`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/parse-image` | POST | Parse recipe from base64 image |
| `/api/ai/generate-recipe` | POST | Generate recipe from text/URL |
| `/api/ai/edit-recipe` | POST | Edit existing recipe with AI |
| `/api/ai/thermomix-method` | POST | Generate Thermomix cooking steps |

## Security Benefits

✅ **API Key Protection** - Never exposed to browser/client code  
✅ **CORS Protection** - Only your frontend can call the backend  
✅ **Rate Limiting Ready** - Easy to add rate limiting at server level  
✅ **Request Validation** - Server validates all incoming requests  
✅ **Error Handling** - Proper error responses without exposing internals  

## Production Deployment

### Option 1: Separate Deployments
- Deploy frontend to: Vercel, Netlify, etc.
- Deploy backend to: Railway, Render, Fly.io, etc.
- Update `VITE_API_URL` in frontend `.env` to point to your backend URL
- Update `FRONTEND_URL` in backend `.env` to your frontend domain

### Option 2: Same Server
- Build both: `npm run build && npm run build:server`
- Serve frontend static files through Express
- Single deployment target

## Troubleshooting

**Port 3001 already in use:**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
```

**CORS errors:**
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure backend server is running

**Environment variables not loading:**
- Ensure `.env` file is in the root directory (not `/server`)
- Restart the server after changing `.env`

## Next Steps

1. ✅ Test all AI features in your app to ensure they work through the backend
2. ⚠️ Remove `VITE_GEMINI_API_KEY` from `.env` once verified
3. 🚀 When deploying, update environment variables for production URLs
