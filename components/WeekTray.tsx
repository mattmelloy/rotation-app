import React from 'react';
import { Meal, DaySlot } from '../types';
import { X, ShoppingBag, Trash2, UserCircle } from 'lucide-react';

interface WeekTrayProps {
  slots: DaySlot[];
  meals: Meal[];
  onRemove: (dayIndex: number, mealId?: string) => void;
  onShopToggle: () => void;
  isShopMode: boolean;
  onClear: () => void;
  onUserClick: () => void;
  onDayClick: (dayIndex: number) => void;
}

const WeekTray: React.FC<WeekTrayProps> = ({ 
  slots, 
  meals, 
  onRemove, 
  onShopToggle, 
  isShopMode, 
  onClear,
  onUserClick,
  onDayClick
}) => {
  // Calculate fill percentage - considering a day "filled" if it has at least one meal
  const filledDays = slots.filter(s => s.mealIds && s.mealIds.length > 0).length;
  const progress = (filledDays / 7) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm pt-3 pb-2 px-1 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Week</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={onClear}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                title="Clear week and reset votes"
            >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Clear</span>
            </button>

            <button 
                onClick={onShopToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isShopMode 
                    ? 'bg-brand-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <ShoppingBag size={14} />
                {isShopMode ? 'Plan' : 'Shop'}
            </button>

            <button 
                onClick={onUserClick}
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="User Settings"
            >
                <UserCircle size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {slots.map((slot, dayIndex) => {
            const dayMeals = slot.mealIds
              .map(id => meals.find(m => m.id === id))
              .filter((m): m is Meal => !!m);

            const hasMeals = dayMeals.length > 0;
            const primaryMeal = dayMeals[0];
            const extraCount = dayMeals.length - 1;
            
            return (
              <div 
                key={dayIndex} 
                className="flex flex-col items-center min-w-0 group/day relative cursor-pointer active:scale-95 transition-transform"
                onClick={() => onDayClick(dayIndex)}
              >
                <span className="text-[10px] font-bold text-gray-400 mb-0.5">{slot.label}</span>
                
                {/* Image Container */}
                <div className="relative h-9 w-9 sm:h-10 sm:w-10 mb-1 flex-shrink-0">
                  {hasMeals ? (
                    <>
                      {/* Stacked effect for multiple meals */}
                      {dayMeals.slice(0, 3).map((meal, idx) => (
                        <div 
                            key={meal.id}
                            className="absolute rounded-full border border-white shadow-sm overflow-hidden bg-white transition-all hover:z-10 hover:scale-110"
                            style={{
                                width: '100%',
                                height: '100%',
                                top: idx * 2,
                                left: idx * 2,
                                zIndex: 3 - idx,
                                transform: extraCount > 0 ? `scale(${1 - (idx * 0.1)})` : 'none'
                            }}
                        >
                           <img 
                            src={meal.image} 
                            alt={meal.title} 
                            className="w-full h-full object-cover"
                          />
                           {!isShopMode && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onRemove(dayIndex, meal.id); }}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="w-full h-full rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    </div>
                  )}
                </div>
                
                {/* Meal Title / Count */}
                <div className="h-6 w-full px-0.5 flex items-start justify-center">
                    {hasMeals ? (
                        <div className="text-center">
                            <p className="text-[8px] sm:text-[9px] leading-[1.1] text-gray-700 font-medium line-clamp-2 w-full break-words overflow-hidden">
                                {primaryMeal.title}
                            </p>
                            {extraCount > 0 && (
                                <p className="text-[8px] text-gray-400 font-bold">+{extraCount} more</p>
                            )}
                        </div>
                    ) : (
                        <span className="text-[10px] text-gray-200 select-none">-</span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WeekTray;
