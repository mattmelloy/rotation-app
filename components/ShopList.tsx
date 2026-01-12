import React, { useState } from 'react';
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
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6 pt-32">
        <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-400 mb-2">Your Tray is Empty</h3>
        <p className="text-gray-400 max-w-xs">Add meals to your active week to generate a shopping list.</p>
      </div>
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
    <div className="pt-32 px-4 pb-24 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
            <ShoppingCart className="w-7 h-7" />
            Shopping List
        </h1>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {todoByMeal.reduce((acc, g) => acc + g.items.length, 0)} to buy
        </div>
      </div>
      
      {/* TODO LIST */}
      <div className="space-y-6">
        {todoByMeal.length === 0 && doneItems.length > 0 && (
            <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100 text-green-800 animate-in zoom-in duration-300">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-1">All Done!</h3>
                <p className="opacity-80">You have everything for this week.</p>
            </div>
        )}

        {todoByMeal.map(({ meal, items }) => (
          <div key={meal.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-50 flex justify-between items-center">
                {meal.title}
                <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{items.length} items</span>
            </h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 group">
                    <button 
                        onClick={() => onToggle(item.id)}
                        className="mt-0.5 w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-brand-500 hover:bg-brand-50 transition-all flex-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                    >
                        {/* Empty Circle */}
                    </button>
                    <span 
                        className="text-gray-700 leading-snug cursor-pointer select-none py-0.5 hover:text-gray-900 transition-colors flex-1"
                        onClick={() => onToggle(item.id)}
                    >
                        {item.text}
                    </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* DONE LIST */}
      {doneItems.length > 0 && (
        <div className="mt-10 border-t border-gray-200 pt-6">
            <button 
                onClick={() => setShowChecked(!showChecked)}
                className="w-full flex items-center justify-between text-gray-400 font-bold uppercase tracking-wider text-xs mb-4 hover:text-gray-600 transition-colors group"
            >
                <span className="flex items-center gap-2">
                    Already Have / Checked ({doneItems.length})
                </span>
                {showChecked ? <ChevronUp size={16} className="text-gray-300 group-hover:text-gray-500"/> : <ChevronDown size={16} className="text-gray-300 group-hover:text-gray-500"/>}
            </button>
            
            {showChecked && (
                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/50">
                        <ul className="space-y-3">
                        {doneItems.map((item) => (
                            <li key={item.id} className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onToggle(item.id)}
                                    className="mt-0.5 w-6 h-6 rounded-full bg-brand-500 border-2 border-brand-500 flex items-center justify-center flex-none text-white shadow-sm hover:bg-brand-600 hover:border-brand-600 transition-colors"
                                >
                                    <Check size={14} strokeWidth={3} />
                                </button>
                                <div className="flex flex-col flex-1">
                                    <span 
                                        className="text-gray-600 line-through select-none cursor-pointer"
                                        onClick={() => onToggle(item.id)}
                                    >
                                        {item.text}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">from {item.mealTitle}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ShopList;
