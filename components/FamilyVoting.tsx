import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meal } from '../types';
import { CheckCircle2, Heart, X } from 'lucide-react';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-base flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
        <h2 className="text-xl font-display font-bold text-primary">Pick 5 Favorites</h2>
        <div className="flex gap-3">
             <button onClick={onCancel} className="text-secondary font-medium hover:text-primary transition-colors">Cancel</button>
             <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedIds.length === 0}
              onClick={() => onVoteComplete(meals.filter(m => selectedIds.includes(m.id)))}
              className="bg-primary-500 text-white px-4 py-1 rounded-full font-bold disabled:opacity-50 transition-colors"
          >
              Done ({selectedIds.length}/5)
             </motion.button>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
        >
            {randomMeals.map((meal, index) => (
                <motion.div 
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleVote(meal.id)}
                    className="relative aspect-square cursor-pointer rounded-xl overflow-hidden group transition-all duration-200"
                >
                    <img 
                      src={meal.image} 
                      alt={meal.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 ${isSelected(meal.id) ? 'scale-105' : 'group-hover:scale-105'}`} 
                    />
                    
                    {/* Vote Count Badge if > 0 */}
                    <AnimatePresence>
                      {(meal.votes || 0) > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-2 right-2 bg-surface/90 backdrop-blur-md text-rose-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10"
                          >
                              <Heart size={10} fill="currentColor" />
                              {meal.votes}
                          </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-colors duration-200 ${isSelected(meal.id) ? 'bg-primary-600/40' : 'bg-transparent group-hover:bg-black/10'}`} />
                    
                    {/* Checkmark */}
                    <AnimatePresence>
                      {isSelected(meal.id) && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                              <div className="bg-primary-500 rounded-full p-2">
                                <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                              </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Title Label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                        <p className="text-white text-xs font-bold truncate">{meal.title}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FamilyVoting;