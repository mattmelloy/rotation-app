import React, { useState } from 'react';
import { Meal } from '../types';
import { CheckCircle2, Heart } from 'lucide-react';

interface FamilyVotingProps {
  meals: Meal[];
  onVoteComplete: (selectedMeals: Meal[]) => void;
  onCancel: () => void;
}

const FamilyVoting: React.FC<FamilyVotingProps> = ({ meals, onVoteComplete, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Shuffle meals on mount to give variety for voting
  const [randomMeals] = useState(() => [...meals].sort(() => 0.5 - Math.random()));

  const toggleVote = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(mid => mid !== id));
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold">Pick 5 Favorites</h2>
        <div className="flex gap-3">
             <button onClick={onCancel} className="text-gray-500 font-medium">Cancel</button>
             <button 
                disabled={selectedIds.length === 0}
                onClick={() => onVoteComplete(meals.filter(m => selectedIds.includes(m.id)))}
                className="bg-brand-500 text-white px-4 py-1 rounded-full font-bold disabled:opacity-50"
            >
                Done ({selectedIds.length}/5)
             </button>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {randomMeals.map(meal => (
                <div 
                    key={meal.id}
                    onClick={() => toggleVote(meal.id)}
                    className="relative aspect-square cursor-pointer rounded-xl overflow-hidden group transition-all duration-200"
                >
                    <img src={meal.image} alt="Meal" className={`w-full h-full object-cover transition-transform duration-500 ${isSelected(meal.id) ? 'scale-105' : 'group-hover:scale-105'}`} />
                    
                    {/* Vote Count Badge if > 0 */}
                    {(meal.votes || 0) > 0 && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-rose-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                            <Heart size={10} fill="currentColor" />
                            {meal.votes}
                        </div>
                    )}

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-colors duration-200 ${isSelected(meal.id) ? 'bg-black/40' : 'bg-transparent'}`} />
                    
                    {/* Checkmark */}
                    {isSelected(meal.id) && (
                        <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                            <CheckCircle2 className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                    )}
                    
                    {/* Title Label (Optional for voting clarity) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-white text-xs font-bold truncate">{meal.title}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyVoting;