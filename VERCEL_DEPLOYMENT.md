# Deploy to Vercel Guide

Your app is now ready for Vercel deployment! The Express backend has been converted to Vercel Serverless Functions.

## What Changed

✅ **Serverless Functions Created** (`/api` directory):
- `/api/ai/parse-image.ts` - Parse recipes from images
- `/api/ai/generate-recipe.ts` - Generate recipes from text/URLs  
- `/api/ai/edit-recipe.ts` - Edit recipes with AI
- `/api/ai/thermomix-method.ts` - Generate Thermomix steps

✅ **Frontend Updated** (`ai.ts`):
- Now uses relative `/api` routes (works on Vercel and locally)

✅ **Vercel Config** (`vercel.json`):
- Automatic API routing configured

---

## Deployment Steps

### 1. Install New Dependency

```bash
npm install
```

This installs `@vercel/node` which was just added to `package.json`.

### 2. Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless functions for AI backend"
git push
```

### 3. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `VITE_SUPABASE_URL` | Your Supabase URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

6. **Click "Deploy"** 🚀

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, then add environment variables:
vercel env add GEMINI_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

---

## How It Works

### In Production (Vercel)
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api/ai/*`
- All requests go to the same domain (no CORS issues!)

### Locally (Development)
You have **two options**:

#### Option 1: Use Vercel Dev (Recommended)
```bash
vercel dev
```
This runs both frontend and API functions locally on port 3000, exactly like production.

#### Option 2: Use Vite + Local Express Server
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run dev:server
```
Frontend calls `http://localhost:3001/api/ai/*`

---

## Environment Variables

### Production (Vercel Dashboard)
Set these in your Vercel project settings:
- `GEMINI_API_KEY` - Your Gemini API key
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Local Development
Keep using your `.env` file (never commit this!):
```env
GEMINI_API_KEY="your-key"
VITE_SUPABASE_URL="your-url"
VITE_SUPABASE_ANON_KEY="your-key"
```

---

## Verify Deployment

After deploying:

1. **Visit your site**: `https://your-app.vercel.app`
2. **Test AI features**:
   - Import a recipe from URL
   - Scan a recipe image
   - Generate from title
   - Edit with AI

3. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click "Functions" tab
   - See real-time logs of your API calls

---

## Troubleshooting

### API Functions Not Working

**Check Environment Variables**:
```bash
vercel env ls
```

**View Function Logs**:
- Vercel Dashboard → Your Project → Functions → Logs

### CORS Errors

Vercel serverless functions automatically handle CORS - no configuration needed! If you see CORS errors, verify you're calling the same domain (relative URLs).

### Build Fails

**Check build logs in Vercel dashboard**. Common issues:
- Missing dependencies - run `npm install` locally first
- Environment variables not set
- TypeScript errors - fix locally before deploying

---

## Cost & Limits

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Automatic HTTPS
- ✅ Custom domains

**Gemini API** (Google):
- Free tier: 1,500 requests/day
- Check [Google AI Studio](https://aistudio.google.com/) for your usage

---

## What About the /server Directory?

The Express server in `/server` is no longer needed for Vercel deployment (but keep it for local dev option). The `/api` directory replaces it in production.

You can:
- **Keep both** - Use Express locally, Vercel functions in production
- **Remove /server** - Use `vercel dev` for local development

---

## Next Steps

1. ✅ Deploy to Vercel
2. 🧪 Test all AI features in production
3. 🔗 Add a custom domain (optional)
4. 📊 Monitor usage in Vercel dashboard

Your app is production-ready! 🎉
