# The Rotation 🍽️

A smart meal planning application that helps you organize your weekly meals, generate recipes with AI, and sync across devices.

![The Rotation](public/favicon.svg)

## ✨ Features

- **📅 Weekly Meal Planning**: Drag and drop meals into your weekly schedule.
- **🤖 AI Recipe Generation**:
  - **Magic Import**: Paste any recipe URL to import it instantly.
  - **Photo Scan**: Take a photo of a cookbook page to digitize recipes.
  - **Thermomix Conversion**: AI automatically converts standard recipes into Thermomix/kitchen robot steps.
  - **AI Chef**: Generate recipes just from a title (e.g., "Grandma's Apple Pie").
- **☁️ Cloud Sync**: Sync your meal plan and recipes across all devices using Supabase.
- **🛒 Smart Shopping List**: Automatically generate shopping lists from your weekly meal plan.
- **🔄 Rotation Tiers**: Organize meals by frequency (Heavy Hitters, The Bench, The Archive).

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase account
- A Google Cloud account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mattmelloy/rotation-app.git
   cd rotation-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run Locally**
   ```bash
   npm run dev:all
   ```
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📦 Deployment

This app is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Deploy! 🚀

See `VERCEL_DEPLOYMENT.md` for a detailed guide.

## 🗄️ Database Setup

Run the SQL commands found in `supabase_schema.sql` in your Supabase SQL Editor to set up the necessary tables and security policies.

## 📄 License

MIT License
