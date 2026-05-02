import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meal, DaySlot } from '../types';
import { ShoppingCart, Check, ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';

interface ShopListProps {
  slots: DaySlot[];
  meals: Meal[];
  checkedItems: string[];
  onToggle: (id: string) => void;
}

interface ChecklistItem {
  id: string; // mealId-index
  text: string;
  mealTitle: string;
  mealId: string;
  index: number;
}

const ShopList: React.FC<ShopListProps> = ({ slots, meals, checkedItems, onToggle }) => {
  // Collect all meals from all slots (flattening the array of arrays)
  const activeMeals = slots
    .flatMap(slot => slot.mealIds) // Get all meal IDs
    .map(id => meals.find(m => m.id === id)) // Resolve to Meal objects
    .filter((m): m is Meal => !!m); // Remove nulls

  const [showChecked, setShowChecked] = useState(true);

  if (activeMeals.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-[50vh] text-center px-6 pt-32"
      >
        <PackageOpen className="w-16 h-16 text-secondary mb-4" />
        <h3 className="text-xl font-display font-bold text-primary mb-2">Your Tray is Empty</h3>
        <p className="text-secondary max-w-xs">Add meals to your active week to generate a shopping list.</p>
      </motion.div>
    );
  }

  // Group items into "To Buy" and "Done"
  const todoByMeal: { meal: Meal; items: ChecklistItem[] }[] = [];
  const doneItems: ChecklistItem[] = [];

  activeMeals.forEach(meal => {
    // If no ingredients, use title as a fallback item
    const rawIngredients = (meal.ingredients && meal.ingredients.length > 0) 
        ? meal.ingredients 
        : [meal.title]; 

    const mealTodo: ChecklistItem[] = [];

    rawIngredients.forEach((text, index) => {
      const id = `${meal.id}-${index}`;
      const item: ChecklistItem = { id, text, mealTitle: meal.title, mealId: meal.id, index };
      
      if (checkedItems.includes(id)) {
        doneItems.push(item);
      } else {
        mealTodo.push(item);
      }
    });

    if (mealTodo.length > 0) {
      todoByMeal.push({ meal, items: mealTodo });
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pt-32 px-4 pb-24 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-3 text-primary">
            <ShoppingCart className="w-7 h-7 text-primary-600" />
            Shopping List
        </h1>
        <div className="text-sm font-medium text-secondary bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
            {todoByMeal.reduce((acc, g) => acc + g.items.length, 0)} to buy
        </div>
      </div>
      
      {/* TODO LIST */}
      <div className="space-y-6">
        <AnimatePresence>
          {todoByMeal.length === 0 && doneItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 text-center bg-secondary-50 dark:bg-secondary-950/50 rounded-2xl border border-secondary-200 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200"
              >
                  <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Check className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-1">All Done!</h3>
                  <p className="opacity-80">You have everything for this week.</p>
              </motion.div>
          )}
        </AnimatePresence>

        {todoByMeal.map(({ meal, items }, mealIndex) => (
          <motion.div 
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mealIndex * 0.1 }}
            className="bg-surface p-5 rounded-2xl shadow-sm border border-border"
          >
            <h2 className="font-display font-bold text-lg text-primary mb-4 pb-2 border-b border-border flex justify-between items-center">
                {meal.title}
                <span className="text-xs font-normal text-secondary bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{items.length} items</span>
            </h2>
            <ul className="space-y-3">
              {items.map((item, itemIndex) => (
                <motion.li 
                  key={item.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: itemIndex * 0.05 }}
                  className="flex items-start gap-3 group"
                >
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggle(item.id)}
                      className="mt-0.5 w-6 h-6 rounded-full border-2 border-neutral-300 dark:border-neutral-600 bg-surface flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all flex-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                    >
                        {/* Empty Circle */}
                    </motion.button>
                    <span 
                        className="text-primary leading-snug cursor-pointer select-none py-0.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex-1"
                        onClick={() => onToggle(item.id)}
                    >
                        {item.text}
                    </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* DONE LIST */}
      <AnimatePresence>
        {doneItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-10 border-t border-border pt-6 overflow-hidden"
          >
              <button 
                  onClick={() => setShowChecked(!showChecked)}
                  className="w-full flex items-center justify-between text-secondary font-bold uppercase tracking-wider text-xs mb-4 hover:text-primary transition-colors group"
              >
                  <span className="flex items-center gap-2">
                      Already Have / Checked ({doneItems.length})
                  </span>
                  {showChecked ? <ChevronUp size={16} className="text-neutral-300 group-hover:text-neutral-500"/> : <ChevronDown size={16} className="text-neutral-300 group-hover:text-neutral-500"/>}
              </button>
              
              <AnimatePresence>
                {showChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-neutral-50/80 dark:bg-neutral-900/50 rounded-2xl p-5 border border-border"
                  >
                          <ul className="space-y-3">
                          {doneItems.map((item, index) => (
                              <motion.li 
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity"
                              >
                                  <motion.button 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => onToggle(item.id)}
                                      className="mt-0.5 w-6 h-6 rounded-full bg-primary-500 border-2 border-primary-500 flex items-center justify-center flex-none text-white shadow-sm hover:bg-primary-600 hover:border-primary-600 transition-colors"
                                  >
                                      <Check size={14} strokeWidth={3} />
                                  </motion.button>
                                  <div className="flex flex-col flex-1">
                                      <span 
                                          className="text-secondary line-through select-none cursor-pointer"
                                          onClick={() => onToggle(item.id)}
                                      >
                                          {item.text}
                                      </span>
                                      <span className="text-[10px] text-muted font-medium mt-0.5">from {item.mealTitle}</span>
                                  </div>
                              </motion.li>
                          ))}
                      </ul>
                  </motion.div>
                )}
              </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShopList;
