import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Meal, DaySlot } from '../types';
import { X, ShoppingBag, Trash2, UserCircle, Sparkles, Moon, Sun, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface WeekTrayProps {
  slots: DaySlot[];
  meals: Meal[];
  onRemove: (dayIndex: number, mealId?: string) => void;
  onShopToggle: () => void;
  isShopMode: boolean;
  onClear: () => void;
  onUserClick: () => void;
  onAIChatToggle: () => void;
  onDayClick: (dayIndex: number) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

// Droppable day circle component - Minimal Apple-like design
const DroppableDayCircle: React.FC<{
  slot: DaySlot;
  dayIndex: number;
  dayMeals: Meal[];
  isShopMode: boolean;
  isExpanded: boolean;
  onDayClick: (index: number) => void;
  onRemove: (dayIndex: number, mealId?: string) => void;
}> = ({ slot, dayIndex, dayMeals, isShopMode, isExpanded, onDayClick, onRemove }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dayIndex}`,
    data: { dayIndex },
  });

  const hasMeals = dayMeals.length > 0;
  const primaryMeal = dayMeals[0];

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col items-center cursor-pointer transition-all duration-200
        ${isExpanded ? 'flex-1' : ''}
      `}
      onClick={() => onDayClick(dayIndex)}
    >
      {/* Day Label */}
      <span className="text-[10px] font-semibold text-secondary mb-1">{slot.label}</span>
      
      {/* Day Circle - Minimal indicator */}
      <div 
        className={`
          relative w-8 h-8 rounded-full flex items-center justify-center
          transition-all duration-200 ease-out
          ${isOver ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : ''}
          ${hasMeals 
            ? 'bg-primary-500 text-white shadow-sm' 
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
          }
        `}
      >
        {hasMeals ? (
          <span className="text-xs font-bold">{dayMeals.length}</span>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        )}
      </div>

      {/* Expanded View - Show meal info */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-center w-full"
          >
            {hasMeals ? (
              <div className="space-y-1">
                {/* Stacked thumbnails */}
                <div className="flex justify-center -space-x-1">
                  {dayMeals.slice(0, 3).map((meal, idx) => (
                    <div
                      key={meal.id}
                      className="w-6 h-6 rounded-full border border-white dark:border-neutral-800 overflow-hidden bg-surface"
                      style={{ zIndex: 3 - idx }}
                    >
                      <img
                        src={meal.image}
                        alt={meal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-primary font-medium line-clamp-1 px-1">
                  {primaryMeal?.title}
                </p>
                {dayMeals.length > 1 && (
                  <p className="text-[8px] text-secondary">+{dayMeals.length - 1} more</p>
                )}
                {/* Remove button */}
                {!isShopMode && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRemove(dayIndex, primaryMeal?.id); 
                    }}
                    className="text-[8px] text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[9px] text-neutral-400 dark:text-neutral-500">
                Empty
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WeekTray: React.FC<WeekTrayProps> = ({ 
  slots, 
  meals, 
  onRemove, 
  onShopToggle, 
  isShopMode, 
  onClear,
  onUserClick,
  onAIChatToggle,
  onDayClick,
  isDark = false,
  onToggleTheme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate fill percentage
  const filledDays = slots.filter(s => s.mealIds && s.mealIds.length > 0).length;
  const totalMeals = slots.reduce((acc, s) => acc + (s.mealIds?.length || 0), 0);

  return (
    <motion.div 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-surface/95 backdrop-blur-xl 
        border-b border-border 
        transition-all duration-300 ease-out
        ${isExpanded ? 'h-[120px]' : 'h-[60px]'}
      `}
    >
      <div className="max-w-4xl mx-auto h-full flex flex-col justify-center px-4">
        {/* Main Row - Always visible */}
        <div className="flex items-center justify-between">
          {/* Left: Day Circles */}
          <div className="flex items-center gap-1 sm:gap-2">
            {slots.map((slot, dayIndex) => {
              const dayMeals = slot.mealIds
                .map(id => meals.find(m => m.id === id))
                .filter((m): m is Meal => !!m);

              return (
                <DroppableDayCircle
                  key={dayIndex}
                  slot={slot}
                  dayIndex={dayIndex}
                  dayMeals={dayMeals}
                  isShopMode={isShopMode}
                  isExpanded={isExpanded}
                  onDayClick={onDayClick}
                  onRemove={onRemove}
                />
              );
            })}
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-2">
            {/* Week Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary">
              <span className="font-medium">{filledDays}/7</span>
              <span className="text-neutral-400">filled</span>
            </div>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Add Meal Button */}
            <button
              onClick={onAIChatToggle}
              className="p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              title="Add Meal"
            >
              <Plus size={14} />
            </button>

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}

            {/* Shop/Plan Toggle */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={onShopToggle}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${isShopMode 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }
              `}
            >
              <ShoppingBag size={12} />
              <span className="hidden sm:inline">{isShopMode ? 'Plan' : 'Shop'}</span>
            </motion.button>

            {/* User Settings */}
            <button 
              onClick={onUserClick}
              className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="Settings"
            >
              <UserCircle size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Actions Row */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-border"
            >
              {/* AI Chef Button */}
              <button
                onClick={onAIChatToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium"
              >
                <Sparkles size={12} />
                AI Chef
              </button>

              {/* Clear Week */}
              <button 
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 size={12} />
                Clear Week
              </button>

              {/* Total meals indicator */}
              <div className="text-xs text-secondary">
                {totalMeals} meal{totalMeals !== 1 ? 's' : ''} planned
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WeekTray;
