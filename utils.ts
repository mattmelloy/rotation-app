import { Tier, Effort, Meal } from './types';

const DAY_MS = 86400000;

// Tier display configuration
export const TIER_CONFIG = {
  favorites: {
    icon: 'Favorites',
    label: 'Favorites',
    description: 'Weekly go-to meals',
    bgClass: 'bg-amber-50/50 dark:bg-amber-950/20',
    borderClass: 'border-l-4 border-amber-400',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  regulars: {
    icon: 'Regulars',
    label: 'Regulars',
    description: 'Monthly rotation meals',
    bgClass: 'bg-slate-50/50 dark:bg-slate-950/20',
    borderClass: 'border-l-4 border-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
  },
  occasional: {
    icon: 'Occasional',
    label: 'Occasional',
    description: 'Special occasions, experiments',
    bgClass: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    borderClass: 'border-l-4 border-indigo-400',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  },
} as const;

// Migration helper: Convert old lastCooked-based tier to new user-selected tier
export const migrateTierFromLastCooked = (lastCookedTimestamp: number): Tier => {
  const daysAgo = (Date.now() - lastCookedTimestamp) / DAY_MS;
  if (daysAgo <= 14) return 'favorites';
  if (daysAgo <= 60) return 'regulars';
  return 'occasional';
};

// Get tier from meal (with fallback for migration)
export const getMealTier = (meal: Meal): Tier => {
  // If meal has tier field, use it
  if (meal.tier) return meal.tier;
  // Fallback to migration logic for backward compatibility
  return migrateTierFromLastCooked(meal.lastCooked);
};

export const getEffortColor = (effort: Effort): string => {
  switch (effort) {
    case 'easy': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'hard': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export const determineProtein = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('beef') || t.includes('steak') || t.includes('burger')) return 'Beef';
  if (t.includes('chicken') || t.includes('wings')) return 'Chicken';
  if (t.includes('pork') || t.includes('bacon') || t.includes('ham')) return 'Pork';
  if (t.includes('fish') || t.includes('salmon') || t.includes('tuna') || t.includes('shrimp')) return 'Seafood';
  if (t.includes('tofu') || t.includes('salad') || t.includes('veg') || t.includes('pizza')) return 'Vegetarian';
  return 'Pantry / Misc';
};

export const determineImage = (title: string): string => {
  // Use a web search proxy to find a relevant real image
  const query = encodeURIComponent(`${title} delicious cooked food`);
  return `https://tse2.mm.bing.net/th?q=${query}&w=800&h=600&c=7&rs=1&p=0`;
};

/**
 * Resizes and compresses an image file to a base64 string.
 * Helps prevent localStorage QuotaExceededError.
 */
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG
            resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
            reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};