import { Tier, Effort, Meal } from './types';

const DAY_MS = 86400000;

export const getTier = (lastCookedTimestamp: number): Tier => {
  const daysAgo = (Date.now() - lastCookedTimestamp) / DAY_MS;
  if (daysAgo <= 14) return 'high';
  if (daysAgo <= 60) return 'medium';
  return 'low';
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