import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Search, X, LogOut, Trash2, UserCircle, Database, ChevronRight, Loader2 } from 'lucide-react';
import { Meal, ViewMode, DAYS, Tier } from './types';
import { getMealTier, TIER_CONFIG } from './utils';
import { supabase } from './lib/supabase';

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Droppable Tier Section Component
const DroppableTierSection: React.FC<{
  tier: Tier;
  title: string;
  description: string;
  meals: Meal[];
  onAdd: (meal: Meal) => void;
  onView: (meal: Meal) => void;
  children: React.ReactNode;
}> = ({ tier, title, description, meals, onAdd, onView, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `tier-${tier}`,
    data: { tier },
  });

  return (
    <motion.section
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative rounded-2xl p-4 transition-all duration-200
        ${TIER_CONFIG[tier].bgClass} ${TIER_CONFIG[tier].borderClass}
        ${isOver ? 'ring-2 ring-primary-500 ring-offset-2 scale-[1.01]' : ''}
      `}
    >
      <h2 className="section-header mb-4">
        {title}
        <span className="text-xs font-normal text-secondary ml-2">{description}</span>
      </h2>
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-primary-500/10 rounded-2xl flex items-center justify-center pointer-events-none">
          <span className="text-primary-600 font-medium text-sm">Drop to change tier</span>
        </div>
      )}
    </motion.section>
  );
};

// Hooks
import { useMeals } from './hooks/useMeals';
import { useCloudSync } from './hooks/useCloudSync';
import { useTheme } from './hooks/useTheme';

// Components
import WeekTray from './components/WeekTray';
import MealCard from './components/MealCard';
import AddMealModal from './components/AddMealModal';
import MealDetailsModal from './components/MealDetailsModal';
import ShopList from './components/ShopList';
import FamilyVoting from './components/FamilyVoting';
import Toast, { ToastType } from './components/Toast';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import AIChefChat from './components/AIChefChat';

function App() {
  // --- Theme ---
  const { isDark, toggleTheme } = useTheme();

  // --- UI State ---
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);
  const [selectingDayForMeal, setSelectingDayForMeal] = useState<Meal | null>(null);
  const [viewingDayIndex, setViewingDayIndex] = useState<number | null>(null);
  const [showLanding, setShowLanding] = useState(false);
  
  // --- Drag and Drop State ---
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
  const [activeTier, setActiveTier] = useState<Tier | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  }, []);

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // --- Business Logic Hooks ---
  // First, create a preliminary user state for determining mode
  const [prelimUser, setPrelimUser] = useState<any>(null);
  
  // Use meals hook with proper context
  const {
      meals, setMeals,
      weekSlots, setWeekSlots,
      shopChecked, setShopChecked,
      safeSetItem,
      handleAddToTray,
      handleRemoveFromTray,
      handleSaveMeal,
      handleDeleteMeal: deleteMealHook,
      handleClearWeek,
      handleRemoveDefaults,
      handleShopToggle,
      handleCleanupStorage,
      handleUpdateMealTier
  } = useMeals({ 
      showToast, 
      isGuest, 
      userId: prelimUser?.id || null 
  });

  // Then connect cloud sync
  const {
      user, setUser,
      isAuthModalOpen, setIsAuthModalOpen,
      isLoading
  } = useCloudSync(
      meals, 
      weekSlots, 
      shopChecked, 
      setMeals, 
      setWeekSlots, 
      setShopChecked, 
      showToast, 
      safeSetItem,
      isGuest
  );

  // Keep prelimUser in sync with actual user from cloud sync
  useEffect(() => {
    setPrelimUser(user);
  }, [user]);

  // --- DnD Handlers ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const meal = meals.find(m => m.id === active.id);
    if (meal) {
      setActiveMeal(meal);
      setActiveTier(active.data.current?.tier || null);
    }
  }, [meals]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && activeMeal) {
      const overId = over.id.toString();
      
      // Check if dropped on a day slot
      if (overId.startsWith('day-')) {
        const dayIndex = parseInt(overId.replace('day-', ''), 10);
        if (!isNaN(dayIndex)) {
          handleAddToTray(activeMeal, dayIndex);
        }
      }
      // Check if dropped on a tier section
      else if (overId.startsWith('tier-')) {
        const newTier = overId.replace('tier-', '') as Tier;
        if (newTier && activeTier !== newTier) {
          handleUpdateMealTier(activeMeal.id, newTier);
          showToast(`Moved ${activeMeal.title} to ${TIER_CONFIG[newTier].label}`, 'success');
        }
      }
    }
    
    setActiveMeal(null);
    setActiveTier(null);
  }, [activeMeal, activeTier, handleAddToTray, handleUpdateMealTier, showToast]);

  const handleDragCancel = useCallback(() => {
    setActiveMeal(null);
    setActiveTier(null);
  }, []);

  // --- Handlers that rely on UI state or specific flows ---

  const onSaveMealWrapper = useCallback((meal: Meal) => {
      handleSaveMeal(meal, editingMeal, setEditingMeal);
  }, [handleSaveMeal, editingMeal]);

  const handleLogout = useCallback(async () => {
      await supabase?.auth.signOut();
      setUser(null);
      showToast("Logged out successfully");
      setIsUserMenuOpen(false);
  }, [showToast]);

  const openAddModal = useCallback(() => {
    setEditingMeal(null);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((meal: Meal) => {
    setViewingMeal(null); // Close details
    setEditingMeal(meal);
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
  }, []);

  const handleDeleteMeal = useCallback((id: string) => {
    deleteMealHook(id);
  }, [deleteMealHook]);

  const handleVotingComplete = (selectedMeals: Meal[]) => {
    // 1. Increment votes for the selected meals
    const updatedMeals = meals.map(meal => {
        if (selectedMeals.some(s => s.id === meal.id)) {
            return { ...meal, votes: (meal.votes || 0) + 1 };
        }
        return meal;
    });
    setMeals(updatedMeals);

    // 2. Add them to the tray
    let currentSlots = [...weekSlots];
    
    // Distribute meals across days that aren't full (limit 3 per day)
    let mealIndex = 0;
    
    // Try 3 passes to fill slots evenly
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < currentSlots.length && mealIndex < selectedMeals.length; i++) {
            if (currentSlots[i].mealIds.length <= pass) {
                 currentSlots[i] = {
                     ...currentSlots[i],
                     mealIds: [...currentSlots[i].mealIds, selectedMeals[mealIndex].id]
                 };
                 mealIndex++;
            }
        }
    }
    
    setWeekSlots(currentSlots);
    setViewMode('dashboard');
    showToast(`Added ${selectedMeals.length} family favorites!`);
  };

  // --- Derived State (Tiers & Search) ---
  
  // Sort helper: Most votes first
  const sortByVotes = useCallback((a: Meal, b: Meal) => (b.votes || 0) - (a.votes || 0), []);

  // Group meals by user-selected tier - memoized for performance
  const { favoritesTier, regularsTier, occasionalTier } = useMemo(() => {
    const favorites = meals.filter(m => getMealTier(m) === 'favorites').sort(sortByVotes);
    const regulars = meals.filter(m => getMealTier(m) === 'regulars').sort(sortByVotes);
    const occasional = meals.filter(m => getMealTier(m) === 'occasional').sort(sortByVotes);
    return { favoritesTier: favorites, regularsTier: regulars, occasionalTier: occasional };
  }, [meals, sortByVotes]);

  const filteredMeals = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return meals.filter(meal => (
        meal.title.toLowerCase().includes(q) ||
        meal.protein.toLowerCase().includes(q) ||
        meal.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        meal.ingredients?.some(ing => ing.toLowerCase().includes(q)) ||
        meal.keywords?.some(kw => kw.toLowerCase().includes(q))
      )).sort(sortByVotes);
  }, [meals, searchQuery, sortByVotes]);

  // --- Render ---

  // --- Loading & Splash Screen ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-primary-600" />
        </motion.div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <>
        <LandingPage 
          onGetStarted={() => setIsAuthModalOpen(true)}
          onContinueAsGuest={() => setIsGuest(true)}
        />
        <AuthModal 
           isOpen={isAuthModalOpen}
           onClose={() => setIsAuthModalOpen(false)}
           onShowToast={showToast}
        />
      </>
    );
  }

  // Show landing page when logged-in user clicks logo
  if (showLanding && (user || isGuest)) {
    return (
      <LandingPage 
        onGetStarted={() => setShowLanding(false)}
        onContinueAsGuest={() => setShowLanding(false)}
        isLoggedIn={true}
      />
    );
  }

  if (viewMode === 'voting') {
    return (
        <FamilyVoting 
            meals={meals} 
            onVoteComplete={handleVotingComplete} 
            onCancel={() => setViewMode('dashboard')}
        />
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-base pb-24 text-primary font-sans relative">
        
        <AnimatePresence>
          {toast && (
            <Toast 
                message={toast.msg} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>

        {/* Sticky Week Tray */}
        <WeekTray 
          slots={weekSlots} 
          meals={meals} 
          onRemove={handleRemoveFromTray}
          isShopMode={viewMode === 'shop'}
          onShopToggle={() => setViewMode(prev => prev === 'shop' ? 'dashboard' : 'shop')}
          onClear={handleClearWeek}
          onUserClick={() => setIsUserMenuOpen(true)}
          onAIChatToggle={() => setIsAIChatOpen(true)}
          onDayClick={(index) => setViewingDayIndex(index)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLogoClick={() => setShowLanding(true)}
        />

        {/* Main Content Area */}
        {viewMode === 'shop' ? (
          <ShopList 
              slots={weekSlots} 
              meals={meals} 
              checkedItems={shopChecked}
              onToggle={handleShopToggle}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pt-20"
          >
            
            {/* Search Bar */}
            <div className="px-4 sticky top-[60px] z-40 bg-base/95 backdrop-blur-sm pb-2 pt-1 transition-all">
              <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                  <input
                      type="text"
                      placeholder="Search title, ingredients, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10 pr-10"
                  />
                  {searchQuery && (
                      <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-1"
                      >
                          <X size={16} />
                      </button>
                  )}
              </div>
            </div>

            {searchQuery ? (
               /* Search Results View */
               <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-20 max-w-6xl mx-auto"
               >
                  <h2 className="section-header mb-4">
                      Found {filteredMeals.length} result{filteredMeals.length !== 1 ? 's' : ''}
                  </h2>
                  
                  {filteredMeals.length > 0 ? (
                      <div className="meal-grid">
                          {filteredMeals.map((meal, index) => (
                              <motion.div
                                key={meal.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="stagger-item"
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <MealCard
                                    meal={meal}
                                    tier={getMealTier(meal)}
                                    onAdd={setSelectingDayForMeal}
                                    onView={setViewingMeal}
                                    fluid={true}
                                />
                              </motion.div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-border">
                          <p className="text-secondary mb-2">No meals found matching "{searchQuery}"</p>
                          <button 
                              onClick={() => setSearchQuery('')} 
                              className="text-primary-600 font-medium hover:underline"
                          >
                              Clear search
                          </button>
                      </div>
                  )}
               </motion.section>
            ) : (
               /* New Grid Layout - Apple-like */
               <div className="px-4 pb-20 max-w-6xl mx-auto space-y-8">
                  {/* Favorites Section */}
                  {favoritesTier.length > 0 && (
                    <DroppableTierSection 
                      tier="favorites"
                      title="Favorites"
                      description="Weekly go-to meals"
                      meals={favoritesTier}
                      onAdd={setSelectingDayForMeal}
                      onView={setViewingMeal}
                    >
                      <div className="meal-grid">
                        {favoritesTier.map((meal, index) => (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="stagger-item"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <MealCard 
                              meal={meal} 
                              tier="favorites" 
                              onAdd={setSelectingDayForMeal} 
                              onView={setViewingMeal}
                              fluid={true}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </DroppableTierSection>
                  )}

                  {/* Regulars Section */}
                  {regularsTier.length > 0 && (
                    <DroppableTierSection 
                      tier="regulars"
                      title="Regulars"
                      description="Monthly rotation meals"
                      meals={regularsTier}
                      onAdd={setSelectingDayForMeal}
                      onView={setViewingMeal}
                    >
                      <div className="meal-grid">
                        {regularsTier.map((meal, index) => (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="stagger-item"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <MealCard 
                              meal={meal} 
                              tier="regulars" 
                              onAdd={setSelectingDayForMeal} 
                              onView={setViewingMeal}
                              fluid={true}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </DroppableTierSection>
                  )}

                  {/* Occasional Section */}
                  {occasionalTier.length > 0 && (
                    <DroppableTierSection 
                      tier="occasional"
                      title="Occasional"
                      description="Special occasions & experiments"
                      meals={occasionalTier}
                      onAdd={setSelectingDayForMeal}
                      onView={setViewingMeal}
                    >
                      <div className="meal-grid">
                        {occasionalTier.map((meal, index) => (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="stagger-item"
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <MealCard 
                              meal={meal} 
                              tier="occasional" 
                              onAdd={setSelectingDayForMeal} 
                              onView={setViewingMeal}
                              fluid={true}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </DroppableTierSection>
                  )}
               </div>
            )}

          </motion.div>
        )}

        {/* Floating Action Button & Family Mode Toggle */}
        {viewMode === 'dashboard' && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-4 items-end z-40">
             {/* Family Vote Button */}
             <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('voting')}
              className="bg-surface text-primary p-3 rounded-full shadow-lg border border-border hover:shadow-xl transition-shadow"
              title="Kids Vote Mode"
            >
              <Users size={24} />
            </motion.button>

            {/* Add Meal FAB */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="bg-primary-600 text-white p-4 rounded-full shadow-xl hover:bg-primary-700 transition-colors"
            >
              <Plus size={28} />
            </motion.button>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeMeal && (
            <div className="opacity-80 pointer-events-none">
              <MealCard 
                meal={activeMeal} 
                tier={activeTier || 'regulars'} 
                onAdd={() => {}} 
                onView={() => {}}
                draggable={false}
              />
            </div>
          )}
        </DragOverlay>

        {/* Modals */}
        <AIChefChat 
          isOpen={isAIChatOpen} 
          onClose={() => setIsAIChatOpen(false)} 
        />

        <AddMealModal 
          isOpen={isAddModalOpen} 
          onClose={closeAddModal} 
          onSave={onSaveMealWrapper}
          initialMeal={editingMeal}
          onDelete={handleDeleteMeal}
          onShowToast={showToast}
        />
        
        <MealDetailsModal 
          meal={viewingMeal}
          onClose={() => setViewingMeal(null)}
          onEdit={openEditModal}
          onAdd={(meal) => {
              setViewingMeal(null);
              setSelectingDayForMeal(meal);
          }}
          onUpdateTier={handleUpdateMealTier}
        />
        
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onShowToast={showToast}
        />

        {/* Day Selector Modal */}
        <AnimatePresence>
          {selectingDayForMeal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectingDayForMeal(null)} />
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-sm bg-surface p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl m-4"
              >
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display font-bold text-lg text-primary">Add to which day?</h3>
                      <button onClick={() => setSelectingDayForMeal(null)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                          <X size={20} className="text-secondary" />
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                      {FULL_DAYS.map((day, index) => (
                          <motion.button
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                  handleAddToTray(selectingDayForMeal, index);
                                  setSelectingDayForMeal(null);
                              }}
                              className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-2 border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all"
                          >
                              <span className="text-sm font-bold text-primary">{day}</span>
                              <span className="text-xs bg-surface px-2 py-0.5 rounded-full border border-border text-secondary font-medium">
                                  {weekSlots[index]?.mealIds.length || 0}
                              </span>
                          </motion.button>
                      ))}
                      
                      {/* Auto Assign Button */}
                      <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                              handleAddToTray(selectingDayForMeal);
                              setSelectingDayForMeal(null);
                          }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all col-span-2"
                      >
                          <span className="text-sm font-bold">Auto Assign</span>
                          <span className="text-xs opacity-60">Next Empty Slot</span>
                      </motion.button>
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Details Modal (View Menu) */}
        <AnimatePresence>
          {viewingDayIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingDayIndex(null)} />
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-sm bg-surface p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl m-4 max-h-[80vh] flex flex-col"
              >
                  <div className="flex justify-between items-center mb-4 flex-none">
                      <h3 className="font-display font-bold text-lg text-primary">{FULL_DAYS[viewingDayIndex]}'s Menu</h3>
                      <button onClick={() => setViewingDayIndex(null)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                          <X size={20} className="text-secondary" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 custom-scrollbar">
                      {weekSlots[viewingDayIndex]?.mealIds?.length > 0 ? (
                          weekSlots[viewingDayIndex].mealIds.map((mealId, idx) => {
                              const meal = meals.find(m => m.id === mealId);
                              if (!meal) return null;
                              return (
                                  <motion.div 
                                    key={`${mealId}-${idx}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-border"
                                  >
                                      <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                                          <img src={meal.image} className="w-full h-full object-cover" alt={meal.title} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="font-bold text-sm text-primary truncate">{meal.title}</p>
                                          <p className="text-xs text-secondary">{meal.protein}</p>
                                      </div>
                                      <button 
                                          onClick={() => handleRemoveFromTray(viewingDayIndex, mealId)}
                                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                                          title="Remove from day"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </motion.div>
                              );
                          })
                      ) : (
                          <div className="text-center py-8 text-secondary border-2 border-dashed border-border rounded-xl">
                              <p>No meals planned for this day.</p>
                          </div>
                      )}
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Menu Modal (Centered) */}
        <AnimatePresence>
          {isUserMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUserMenuOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative z-10"
              >
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-b border-border flex items-center justify-between">
                      <h3 className="font-display font-bold text-primary flex items-center gap-2">
                          <UserCircle className="text-primary-600" size={20} />
                          Settings
                      </h3>
                      <button onClick={() => setIsUserMenuOpen(false)} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full text-secondary">
                          <X size={18} />
                      </button>
                  </div>

                  <div className="p-2 space-y-1">
                      {user ? (
                          <div className="px-4 py-3 bg-primary-50 dark:bg-primary-950/50 mx-2 mt-2 rounded-xl mb-3">
                              <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                              <p className="text-sm font-medium text-primary-900 dark:text-primary-100 truncate">{user.email}</p>
                              <div className="text-[10px] text-primary-500 dark:text-primary-400 mt-1 flex items-center gap-1">
                                  <Database size={10} /> 
                                  <span>Data is syncing to <b>user_data</b> table</span>
                              </div>
                          </div>
                      ) : (
                          <div className="px-4 py-4 bg-neutral-50 dark:bg-neutral-900 mx-2 mt-2 rounded-xl mb-3 border border-dashed border-border text-center">
                              <p className="text-sm text-secondary mb-3">Sign in to sync your meals across devices and keep them safe.</p>
                              <button 
                                  onClick={() => { setIsUserMenuOpen(false); setIsAuthModalOpen(true); }}
                                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-primary-700 transition-colors"
                              >
                                  Sign In / Create Account
                              </button>
                          </div>
                      )}

                      <button 
                          onClick={() => { handleCleanupStorage(); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl flex items-center justify-between group transition-colors"
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                  <Database size={16} />
                              </div>
                              <span className="text-sm font-medium text-primary">Free Up Space (Delete Scans)</span>
                          </div>
                          <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-500" />
                      </button>

                      <button 
                          onClick={() => handleRemoveDefaults(setIsUserMenuOpen)}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl flex items-center justify-between group transition-colors"
                      >
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                  <Trash2 size={16} />
                              </div>
                              <span className="text-sm font-medium text-primary">Remove Example Meals</span>
                          </div>
                          <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-500" />
                      </button>

                       {user && (
                          <button 
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl flex items-center justify-between group transition-colors"
                          >
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                                      <LogOut size={16} />
                                  </div>
                                  <span className="text-sm font-medium text-primary group-hover:text-red-600 dark:group-hover:text-red-400">Sign Out</span>
                              </div>
                          </button>
                       )}
                  </div>
                  
                  <div className="p-3 text-center text-[10px] text-secondary bg-neutral-50 dark:bg-neutral-900 border-t border-border">
                      The Rotation v2.0
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DndContext>
  );
}

export default App;
