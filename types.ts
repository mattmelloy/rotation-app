export type Effort = 'easy' | 'medium' | 'hard';
export type Tier = 'high' | 'medium' | 'low';
export type SourceType = 'url' | 'image' | 'ai' | 'manual';

export interface Meal {
  id: string;
  title: string;
  lastCooked: number; // Timestamp
  image: string; // The presentation image (food)
  effort: Effort;
  protein: string;
  keywords: string[];
  // Extended fields
  description?: string;
  ingredients?: string[];
  method?: string[];
  thermomixMethod?: string[]; // Added: Parallel method for kitchen robots
  sourceUrl?: string;
  tags?: string[]; // User defined tags (e.g. "BBQ", "Rice", "Salad")
  
  // Source Tracking
  sourceType?: SourceType;
  sourceImage?: string; // The original recipe scan (cookbook page/handwritten note)
  
  // Gamification
  votes?: number; // Number of times voted for in Family Mode
}

export interface DaySlot {
  label: string; // M, T, W...
  mealIds: string[]; // Changed from single mealId to array
}

export type ViewMode = 'dashboard' | 'voting' | 'shop';

export const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
