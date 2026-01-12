import React from 'react';
import { Meal, Tier } from '../types';
import { getEffortColor } from '../utils';
import { Plus, Eye, Heart } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  tier: Tier;
  onAdd: (meal: Meal) => void;
  onView: (meal: Meal) => void;
  disabled?: boolean;
  fluid?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, tier, onAdd, onView, disabled, fluid }) => {
  // Styles based on tier
  const cardSizeClasses = {
    high: 'min-w-[280px] w-[280px] h-[340px]',
    medium: 'min-w-[200px] w-[200px] h-[260px]',
    low: 'min-w-[160px] w-[160px] h-[200px]',
  };

  const imageHeightClasses = {
    high: 'h-[220px]',
    medium: 'h-[160px]',
    low: 'h-[120px]',
  };

  const textSizeClasses = {
    high: 'text-xl',
    medium: 'text-lg',
    low: 'text-sm',
  };

  // Override styles if fluid mode (for search grid)
  const containerClass = fluid 
    ? 'w-full flex flex-col h-full min-h-[280px]' 
    : `${cardSizeClasses[tier]} snap-start`;

  const imageClass = fluid 
    ? 'aspect-[4/3] w-full' 
    : imageHeightClasses[tier];

  const titleClass = fluid
    ? 'text-lg'
    : textSizeClasses[tier];

  return (
    <div 
      className={`
        relative flex flex-col text-left bg-white rounded-2xl shadow-sm hover:shadow-md 
        transition-all duration-200 border border-gray-100 overflow-hidden group
        ${containerClass}
      `}
    >
      {/* Image Section - Click to View */}
      <button 
        onClick={() => onView(meal)}
        className={`w-full relative block text-left flex-none ${imageClass} ${disabled ? 'opacity-50' : ''}`}
      >
        <img 
          src={meal.image} 
          alt={meal.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        
        {/* Vote Badge - Defensive check for > 0 */}
        {(meal.votes || 0) > 0 && (
            <div className="absolute top-3 left-3 shadow-lg z-10 bg-white/90 backdrop-blur-sm text-rose-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Heart size={12} fill="currentColor" />
                {meal.votes}
            </div>
        )}

        {/* Effort Badge */}
        <div className="absolute top-3 right-3 shadow-lg z-10">
           <div className={`w-3 h-3 rounded-full border border-white ${getEffortColor(meal.effort)}`} />
        </div>
        
        {/* Hover Overlay with Eye Icon */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                <Eye size={20} />
            </div>
        </div>

        {/* Days Ago Badge */}
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-md">
           {meal.lastCooked === 0 ? 'Never' : `${Math.floor((Date.now() - meal.lastCooked) / 86400000)}d ago`}
        </div>
      </button>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col relative bg-white">
        <div onClick={() => onView(meal)} className="cursor-pointer flex-1">
          <h3 className={`font-bold text-slate-800 leading-tight ${titleClass} line-clamp-2 mb-1`}>
            {meal.title}
          </h3>
          
          <div className="flex flex-wrap gap-1">
             <span className="text-slate-500 text-xs font-medium">{meal.protein}</span>
             {tier !== 'low' && meal.tags && meal.tags.slice(0, 2).map((tag, i) => (
                 <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md line-clamp-1">{tag}</span>
             ))}
          </div>
        </div>
        
        {/* Add to Week Button */}
        <button 
            onClick={() => !disabled && onAdd(meal)}
            disabled={disabled}
            className="absolute bottom-3 right-3 bg-gray-100 hover:bg-black hover:text-white text-gray-900 p-2 rounded-full transition-colors active:scale-95 shadow-sm"
            title="Add to Week"
        >
            <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default MealCard;
