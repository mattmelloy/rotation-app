import { Meal } from './types';

const NOW = Date.now();
const DAY_MS = 86400000;

// Helper to generate consistent real-world image URLs
const getImg = (q: string) => `https://tse2.mm.bing.net/th?q=${encodeURIComponent(q + ' food photography')}&w=800&h=600&c=7&rs=1&p=0`;

export const INITIAL_MEALS: Meal[] = [
  // High Rotation (Last 14 days)
  {
    id: '1',
    title: 'Taco Tuesday',
    lastCooked: NOW - (2 * DAY_MS),
    image: getImg('beef tacos lime cilantro'),
    effort: 'easy',
    protein: 'Beef',
    keywords: ['mexican', 'beef', 'tacos'],
    sourceType: 'manual',
    tags: ['Family Fav', 'Mexican'],
    votes: 15
  },
  {
    id: '2',
    title: 'Spaghetti Bolognese',
    lastCooked: NOW - (5 * DAY_MS),
    image: getImg('spaghetti bolognese parmesan'),
    effort: 'medium',
    protein: 'Beef',
    keywords: ['pasta', 'italian', 'beef'],
    sourceType: 'manual',
    tags: ['Pasta', 'Italian', 'Comfort'],
    votes: 12
  },
  {
    id: '3',
    title: 'Grilled Salmon & Veg',
    lastCooked: NOW - (10 * DAY_MS),
    image: getImg('grilled salmon roasted vegetables'),
    effort: 'easy',
    protein: 'Fish',
    keywords: ['healthy', 'fish'],
    sourceType: 'ai',
    tags: ['Healthy', 'Low Carb', 'BBQ'],
    votes: 5
  },
  
  // Medium Rotation (14 - 60 days)
  {
    id: '4',
    title: 'Chicken Curry',
    lastCooked: NOW - (20 * DAY_MS),
    image: getImg('chicken curry rice naan'),
    effort: 'medium',
    protein: 'Chicken',
    keywords: ['spicy', 'indian', 'rice'],
    sourceType: 'url',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/chicken-curry',
    tags: ['Spicy', 'Rice', 'Indian'],
    votes: 8
  },
  {
    id: '5',
    title: 'Homemade Pizza',
    lastCooked: NOW - (25 * DAY_MS),
    image: getImg('homemade margherita pizza basil'),
    effort: 'hard',
    protein: 'Vegetarian',
    keywords: ['italian', 'cheese'],
    sourceType: 'manual',
    tags: ['Weekend Project', 'Kids'],
    votes: 20
  },
  {
    id: '6',
    title: 'Stir Fry Noodles',
    lastCooked: NOW - (30 * DAY_MS),
    image: getImg('pork stir fry noodles vegetables'),
    effort: 'easy',
    protein: 'Pork',
    keywords: ['asian', 'quick'],
    sourceType: 'manual',
    tags: ['Asian', 'Noodles', 'Quick'],
    votes: 6
  },
  {
    id: '7',
    title: 'Burger Night',
    lastCooked: NOW - (45 * DAY_MS),
    image: getImg('gourmet cheeseburger fries'),
    effort: 'medium',
    protein: 'Beef',
    keywords: ['american', 'grill'],
    sourceType: 'manual',
    tags: ['American', 'BBQ'],
    votes: 18
  },

  // Low Rotation (> 60 days)
  {
    id: '8',
    title: 'Shepherd’s Pie',
    lastCooked: NOW - (70 * DAY_MS),
    image: getImg('shepherds pie casserole'),
    effort: 'hard',
    protein: 'Lamb',
    keywords: ['winter', 'comfort'],
    sourceType: 'manual',
    tags: ['Winter', 'Casserole'],
    votes: 3
  },
  {
    id: '9',
    title: 'Fish Tacos',
    lastCooked: NOW - (90 * DAY_MS),
    image: getImg('baja fish tacos cabbage'),
    effort: 'medium',
    protein: 'Fish',
    keywords: ['summer', 'mexican'],
    sourceType: 'ai',
    tags: ['Summer', 'Tacos'],
    votes: 7
  },
  {
    id: '10',
    title: 'Beef Stew',
    lastCooked: NOW - (100 * DAY_MS),
    image: getImg('beef stew bowl carrots potatoes'),
    effort: 'hard',
    protein: 'Beef',
    keywords: ['slowcooker', 'winter'],
    sourceType: 'manual',
    tags: ['Slow Cooker', 'Winter'],
    votes: 2
  },
  {
    id: '11',
    title: 'Caesar Salad',
    lastCooked: NOW - (65 * DAY_MS),
    image: getImg('chicken caesar salad'),
    effort: 'easy',
    protein: 'Chicken',
    keywords: ['light', 'healthy'],
    sourceType: 'manual',
    tags: ['Salad', 'Light'],
    votes: 4
  },
   {
    id: '12',
    title: 'Risotto',
    lastCooked: NOW - (120 * DAY_MS),
    image: getImg('mushroom risotto'),
    effort: 'hard',
    protein: 'Vegetarian',
    keywords: ['italian', 'rice'],
    sourceType: 'manual',
    tags: ['Italian', 'Rice'],
    votes: 5
  }
];