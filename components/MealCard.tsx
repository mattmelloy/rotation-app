import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Meal, Tier } from '../types';
import { getEffortColor, TIER_CONFIG } from '../utils';
import { Plus, GripVertical, Star } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  tier: Tier;
  onAdd: (meal: Meal) => void;
  onView: (meal: Meal) => void;
  disabled?: boolean;
  fluid?: boolean;
  draggable?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  tier, 
  onAdd, 
  onView, 
  disabled, 
  fluid,
  draggable = true 
}) => {
  // Setup draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: { meal, tier },
    disabled: disabled || !draggable,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  // Calculate days since cooked
  const daysAgo = meal.lastCooked === 0 
    ? 'Never' 
    : `${Math.floor((Date.now() - meal.lastCooked) / 86400000)}d`;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      animate={{ 
        opacity: isDragging ? 0.6 : 1, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
      }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        relative flex flex-col bg-surface rounded-2xl overflow-hidden
        transition-shadow duration-200 ease-out
        ${isDragging ? 'shadow-xl ring-2 ring-primary-500/50' : 'shadow-card hover:shadow-elevated'}
        ${disabled ? 'opacity-50' : ''}
        ${fluid ? 'w-full h-full min-h-[240px]' : 'w-full max-w-[280px]'}
        group cursor-pointer
      `}
      {...attributes}
    >
      {/* Drag Handle - Only visible on hover when draggable */}
      {draggable && !disabled && (
        <div 
          className="absolute top-2 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <div className="bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-lg">
            <GripVertical size={14} />
          </div>
        </div>
      )}

      {/* Image Section - Clean, no overlay */}
      <div 
        onClick={() => onView(meal)}
        onKeyDown={(e) => e.key === 'Enter' && onView(meal)}
        role="button"
        tabIndex={0}
        className="relative w-full aspect-[4/3] flex-none overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
      >
        <img 
          src={meal.image} 
          alt={meal.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Quick Add Button - Appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            type="button"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              !disabled && onAdd(meal);
            }}
            disabled={disabled}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm flex items-center justify-center text-primary-600 shadow-lg"
          >
            <Plus size={20} />
          </motion.button>
        </div>

        {/* Effort Indicator - Subtle dot, visible on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`w-2.5 h-2.5 rounded-full ${getEffortColor(meal.effort)}`} />
        </div>
        
        {/* Tier Badge - Top left */}
        <div className="absolute top-2 left-2">
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${TIER_CONFIG[tier].badgeClass}`}>
            <Star size={10} />
            <span>{TIER_CONFIG[tier].label}</span>
          </div>
        </div>
      </div>

      {/* Content Section - Clean typography */}
      <div className="flex-1 flex flex-col p-3 bg-surface">
        {/* Title */}
        <div 
          onClick={() => onView(meal)}
          onKeyDown={(e) => e.key === 'Enter' && onView(meal)}
          role="button"
          tabIndex={0}
          className="text-left flex-1 cursor-pointer"
        >
          <h3 className="text-card-title text-primary line-clamp-2 mb-1">
            {meal.title}
          </h3>
          
          {/* Meta: Protein & Days */}
          <div className="flex items-center gap-2 text-card-meta text-secondary">
            <span className="font-medium">{meal.protein}</span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="text-neutral-400">{daysAgo}</span>
          </div>

          {/* Tags - Subtle, max 2 */}
          {meal.tags && meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.tags.slice(0, 2).map((tag, i) => (
                <span 
                  key={i} 
                  className="text-[11px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MealCard;
