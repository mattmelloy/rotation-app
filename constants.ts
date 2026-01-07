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
    votes: 15,
    description: "Classic family favourite tacos with seasoned beef and all the toppings.",
    ingredients: [
      "500g Minced Beef",
      "1 Packet Taco Seasoning",
      "12 Taco Shells (Hard or Soft)",
      "1 Onion, diced",
      "Iceberg Lettuce, shredded",
      "Cheddar Cheese, grated",
      "Sour Cream",
      "Salsa"
    ],
    method: [
      "Brown the onion and minced beef in a frying pan over medium heat.",
      "Add taco seasoning and a splash of water. Simmer for 5-10 minutes until thickened.",
      "Warm the taco shells in the oven or microwave according to package instructions.",
      "Serve beef in bowls with all toppings on the table for self-assembly."
    ],
    thermomixMethod: [
      "Place cheddar cheese in bowl. Grate 5 sec/speed 9. Set aside.",
      "Place onion and garlic (optional) in bowl. Chop 3 sec/speed 7.",
      "Add oil. Sauté 3 min/120°C/speed 1.",
      "Add minced beef. Cook 10 min/100°C/Reverse/speed 1.",
      "Add taco seasoning and 50g water. Cook 5 min/100°C/Reverse/speed 1.",
      "Serve with warmed shells and toppings."
    ]
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
    votes: 12,
    description: "Rich and hearty meat sauce served over al dente spaghetti.",
    ingredients: [
      "500g Beef Mince",
      "1 Onion, finely chopped",
      "2 Cloves Garlic, crushed",
      "2 x 400g Tins Chopped Tomatoes",
      "2 tbsp Tomato Paste",
      "1 tbsp Dried Oregano",
      "500g Spaghetti",
      "Parmesan Cheese"
    ],
    method: [
      "Sauté onion and garlic in olive oil until soft.",
      "Add beef mince and brown well, breaking up lumps.",
      "Stir in tomato paste, tinned tomatoes, and herbs.",
      "Simmer on low heat for 30-45 minutes.",
      "Cook spaghetti in salted boiling water until al dente.",
      "Toss sauce with pasta and top with parmesan."
    ],
    thermomixMethod: [
      "Place parmesan in bowl. Grate 10 sec/speed 9. Set aside.",
      "Place onion, garlic, carrot (optional) and celery (optional) in bowl. Chop 5 sec/speed 5.",
      "Add oil. Sauté 3 min/120°C/speed 1.",
      "Add beef mince. Cook 5 min/100°C/Reverse/speed 1.",
      "Add tomatoes, paste, and herbs. Cook 20 min/100°C/Reverse/speed 1.",
      "Cook pasta separately on stove or use automated boiling mode if available."
    ]
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
    votes: 5,
    description: "Light and healthy pan-seared salmon with roasted asparagus.",
    ingredients: [
      "4 Salmon Fillets",
      "1 Bunch Asparagus",
      "1 Punnet Cherry Tomatoes",
      "Olive Oil",
      "Lemon Wedges",
      "Salt & Pepper",
      "Fresh Dill"
    ],
    method: [
      "Preheat oven to 200°C. Toss asparagus and tomatoes in oil, salt, and pepper.",
      "Roast vegetables for 12-15 minutes.",
      "Season salmon fillets. Heat oil in a pan over medium-high heat.",
      "Cook salmon skin-side down for 4 mins, flip and cook 2-3 mins until just cooked through.",
      "Serve with lemon wedges."
    ],
    thermomixMethod: [
      "Place 500g water in mixing bowl.",
      "Place potatoes (optional) in simmering basket.",
      "Place salmon fillets in Varoma dish, season with dill and lemon.",
      "Place asparagus and tomatoes on Varoma tray.",
      "Steam 20 min/Varoma/speed 2.",
      "Serve with fresh lemon juice."
    ]
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
    votes: 8,
    description: "Creamy and mild chicken curry, perfect for the whole family.",
    ingredients: [
      "500g Chicken Thigh, diced",
      "1 Onion",
      "2 tbsp Curry Paste (Yellow or Red)",
      "1 tin Coconut Milk",
      "1 cup Peas (frozen)",
      "Basmati Rice",
      "Naan Bread"
    ],
    method: [
      "Brown onion and chicken in a pot.",
      "Stir in curry paste and cook for 1 minute until fragrant.",
      "Add coconut milk and simmer for 15-20 minutes.",
      "Stir in peas in the last 2 minutes.",
      "Serve with steamed rice and naan."
    ],
    thermomixMethod: [
      "Place onion and garlic in bowl. Chop 3 sec/speed 7.",
      "Add oil. Sauté 3 min/120°C/speed 1.",
      "Add curry paste. Cook 1 min/100°C/speed 1.",
      "Add chicken and coconut milk. Cook 15 min/100°C/Reverse/speed soft.",
      "Add peas through hole in lid. Cook 2 min/100°C/Reverse/speed soft.",
      "Serve with rice cooked in simmering basket or separately."
    ]
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
    votes: 20,
    description: "Friday night fun making pizzas from scratch.",
    ingredients: [
      "Pizza Dough (store bought or homemade)",
      "Pizza Sauce",
      "Mozzarella Cheese",
      "Toppings: Pepperoni, Mushrooms, Ham, Pineapple, Capsicum"
    ],
    method: [
      "Preheat oven to 240°C (very hot).",
      "Roll out dough on a floured surface.",
      "Spread sauce and sprinkle with cheese.",
      "Add desired toppings.",
      "Bake for 10-12 minutes until crust is golden and cheese is bubbly."
    ],
    thermomixMethod: [
      "Place 220g water, 1 tsp sugar, 2 tsp yeast in bowl. Heat 2 min/37°C/speed 2.",
      "Add 400g flour, 30g oil, 1 tsp salt. Knead 2 min/Dough mode.",
      "Let rise in a warm bowl for 1 hour.",
      "Grate cheese 5 sec/speed 7.",
      "Make sauce: Blitz tomatoes, garlic, herbs 5 sec/speed 5, then cook 10 min/100°C/speed 2."
    ]
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
    votes: 6,
    description: "Quick weeknight noodle toss with pork and veggies.",
    ingredients: [
      "400g Pork Mince or Strips",
      "1 packet Hokkien Noodles",
      "1 bag Stir Fry Veg Mix",
      "2 tbsp Soy Sauce",
      "1 tbsp Oyster Sauce",
      "1 tsp Ginger, grated",
      "Sesame Oil"
    ],
    method: [
      "Soak noodles in hot water to separate.",
      "Stir fry pork in a hot wok until cooked. Remove.",
      "Stir fry vegetables for 2-3 minutes.",
      "Return pork, add noodles and sauces.",
      "Toss well until heated through."
    ],
    thermomixMethod: [
      "Place garlic and ginger in bowl. Chop 3 sec/speed 7.",
      "Add oil and pork. Cook 5 min/120°C/Reverse/speed 1.",
      "Add hard vegetables (carrots, broccoli). Cook 3 min/100°C/Reverse/speed 1.",
      "Add noodles, soft veg, and sauce. Cook 2 min/100°C/Reverse/speed 1 (assist with spatula)."
    ]
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
    votes: 18,
    description: "Juicy homemade burgers with chips.",
    ingredients: [
      "500g Beef Mince",
      "4 Burger Buns",
      "Cheese Slices",
      "Lettuce, Tomato, Beetroot",
      "Sauce (BBQ or Tomato)",
      "Frozen Chips"
    ],
    method: [
      "Mix beef mince with salt and pepper. Form into 4 patties.",
      "Cook chips in oven or air fryer.",
      "Grill patties on BBQ or pan for 4-5 mins each side.",
      "Toast buns lightly.",
      "Assemble burgers with salad, cheese, and sauce."
    ],
    thermomixMethod: [
      "Place onion, garlic, parsley in bowl. Chop 3 sec/speed 7.",
      "Add mince, egg, breadcrumbs, seasonings. Knead 30 sec/Dough mode.",
      "Shape patties manually.",
      "Cook patties on stove or BBQ.",
      "Use Thermomix to make homemade ketchup or mayo if desired (e.g., Emulsify egg/oil 2 min/speed 4)."
    ]
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
    votes: 3,
    description: "Traditional lamb mince topped with creamy mashed potato.",
    ingredients: [
      "500g Lamb Mince",
      "1 Onion",
      "2 Carrots, diced",
      "1 cup Peas",
      "2 tbsp Gravy Powder/Flour",
      "1 cup Beef Stock",
      "4 Large Potatoes",
      "Butter & Milk (for mash)"
    ],
    method: [
      "Boil potatoes until soft. Mash with butter and milk.",
      "Fry onion, carrots, and lamb mince until brown.",
      "Add flour, stock, and peas. Simmer until thick.",
      "Pour meat mix into a baking dish. Top with mash.",
      "Bake at 180°C for 20-30 mins until golden."
    ],
    thermomixMethod: [
      "Place cheese (for top) in bowl. Grate 5 sec/speed 9. Set aside.",
      "Place onion, carrot, garlic in bowl. Chop 5 sec/speed 5.",
      "Add oil. Sauté 3 min/120°C/speed 1.",
      "Add lamb mince. Cook 5 min/100°C/Reverse/speed 1.",
      "Add stock, paste, peas. Cook 10 min/100°C/Reverse/speed 1. Pour into dish.",
      "Clean bowl. Insert butterfly. Add potatoes (chopped small) and milk. Cook 20 min/95°C/speed 1.",
      "Add butter. Mash 30 sec/speed 3. Spread over meat."
    ]
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
    votes: 7,
    description: "Crispy battered fish in soft tortillas with slaw.",
    ingredients: [
      "Frozen Battered Fish Fillets",
      "Small Tortillas",
      "Red Cabbage, shredded",
      "Carrot, grated",
      "Mayonnaise",
      "Lime",
      "Hot Sauce"
    ],
    method: [
      "Cook fish fillets in oven or air fryer until crispy.",
      "Mix cabbage, carrot, mayo, and lime juice to make slaw.",
      "Warm tortillas.",
      "Cut fish into strips.",
      "Assemble tacos: Slaw, Fish, Hot Sauce."
    ],
    thermomixMethod: [
      "Make the slaw: Place cabbage, carrot, apple (optional) in bowl. Chop 4 sec/speed 4.",
      "Add mayo and lime. Mix 10 sec/Reverse/speed 3.",
      "Fish is best cooked in Air Fryer or Oven for crispiness.",
      "Warm tortillas in Varoma while steaming something else, or microwave."
    ]
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
    votes: 2,
    description: "Tender beef chunks slow cooked with root vegetables.",
    ingredients: [
      "1kg Chuck Steak, cubed",
      "2 Onions, chunked",
      "3 Carrots, chunked",
      "2 Potatoes, chunked",
      "500ml Beef Stock",
      "Red Wine (optional)",
      "Thyme & Bay Leaves"
    ],
    method: [
      "Coat beef in seasoned flour and brown in a pan.",
      "Add all ingredients to a slow cooker.",
      "Cook on Low for 8 hours or High for 4 hours.",
      "Serve with crusty bread."
    ],
    thermomixMethod: [
      "Place onion and garlic in bowl. Chop 3 sec/speed 5. Sauté 3 min/120°C/speed 1.",
      "Add beef, wine (optional), stock, herbs. Cook 40 min/100°C/Reverse/speed spoon.",
      "Add potatoes and carrots. Cook 20 min/100°C/Reverse/speed spoon.",
      "Check meat tenderness. Cook further if needed."
    ]
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
    votes: 4,
    description: "Classic salad with cos lettuce, bacon, croutons, and egg.",
    ingredients: [
      "Cos Lettuce",
      "2 Chicken Breasts, grilled and sliced",
      "4 Bacon Rashers, crispy",
      "2 Eggs, boiled",
      "Croutons",
      "Caesar Dressing",
      "Parmesan Shavings"
    ],
    method: [
      "Boil eggs (soft or hard).",
      "Cook bacon until crispy, chop.",
      "Grill chicken.",
      "Wash and tear lettuce.",
      "Toss lettuce, chicken, bacon, croutons, and dressing.",
      "Top with egg and parmesan."
    ],
    thermomixMethod: [
      "Place 500g water in bowl. Place eggs in basket. Steam 12 min/Varoma/speed 1. Cool and peel.",
      "Chop parmesan 10 sec/speed 9. Set aside.",
      "Make dressing: Garlic, anchovy (optional), egg yolk, lemon, oil. Emulsify 2 min/speed 4.",
      "Cook chicken in Varoma or pan fry.",
      "Assemble salad."
    ]
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
    votes: 5,
    description: "Creamy mushroom risotto with parmesan.",
    ingredients: [
      "300g Arborio Rice",
      "200g Mushrooms, sliced",
      "1 Onion, finely diced",
      "100ml White Wine",
      "800ml Vegetable Stock, hot",
      "Butter",
      "Parmesan Cheese"
    ],
    method: [
      "Sauté onion and mushrooms in butter.",
      "Add rice and stir to coat.",
      "Add wine and stir until absorbed.",
      "Add stock one ladle at a time, stirring constantly until absorbed and rice is creamy (approx 20 mins).",
      "Stir in parmesan and extra butter."
    ],
    thermomixMethod: [
      "Place parmesan in bowl. Grate 10 sec/speed 9. Transfer.",
      "Place onion and garlic in bowl. Chop 3 sec/speed 5. Sauté 3 min/120°C/speed 1.",
      "Add mushrooms. Cook 2 min/100°C/Reverse/speed 1.",
      "Add rice. Sauté 1 min/100°C/Reverse/speed 1 (without cup).",
      "Add wine. Cook 2 min/100°C/Reverse/speed 1 (without cup).",
      "Add stock. Cook 13-15 min/100°C/Reverse/speed 1 (with basket on lid).",
      "Stir in butter and parmesan. Let stand 5 mins."
    ]
  }
];
