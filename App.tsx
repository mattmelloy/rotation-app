import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, X, LogOut, Trash2, UserCircle, Database, ChevronRight, Loader2 } from 'lucide-react';
import { Meal, ViewMode, DAYS } from './types';
import { getTier } from './utils';
import { supabase } from './lib/supabase';

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Hooks
import { useMeals } from './hooks/useMeals';
import { useCloudSync } from './hooks/useCloudSync';

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

function App() {
  // --- UI State ---
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);
  const [selectingDayForMeal, setSelectingDayForMeal] = useState<Meal | null>(null);
  const [viewingDayIndex, setViewingDayIndex] = useState<number | null>(null);

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
  };

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
      handleCleanupStorage
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

  // --- Handlers that rely on UI state or specific flows ---

  const onSaveMealWrapper = (meal: Meal) => {
      handleSaveMeal(meal, editingMeal, setEditingMeal);
  };

  const handleLogout = async () => {
      await supabase?.auth.signOut();
      setUser(null);
      showToast("Logged out successfully");
      setIsUserMenuOpen(false);
  };

  const openAddModal = () => {
    setEditingMeal(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (meal: Meal) => {
    setViewingMeal(null); // Close details
    setEditingMeal(meal);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
  };

  const handleDeleteMeal = (id: string) => {
    deleteMealHook(id);
  };

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
  const sortByVotes = (a: Meal, b: Meal) => (b.votes || 0) - (a.votes || 0);

  const highTier = meals.filter(m => getTier(m.lastCooked) === 'high').sort(sortByVotes);
  const mediumTier = meals.filter(m => getTier(m.lastCooked) === 'medium').sort(sortByVotes);
  const lowTier = meals.filter(m => getTier(m.lastCooked) === 'low').sort(sortByVotes);

  const filteredMeals = searchQuery 
    ? meals.filter(meal => {
        const q = searchQuery.toLowerCase();
        return (
            meal.title.toLowerCase().includes(q) ||
            meal.protein.toLowerCase().includes(q) ||
            meal.tags?.some(tag => tag.toLowerCase().includes(q)) ||
            meal.ingredients?.some(ing => ing.toLowerCase().includes(q)) ||
            meal.keywords?.some(kw => kw.toLowerCase().includes(q))
        );
      }).sort(sortByVotes)
    : [];

  // --- Render ---

  // --- Loading & Splash Screen ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
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
    <div className="min-h-screen bg-gray-50 pb-24 text-slate-800 font-sans relative">
      
      {toast && (
        <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}

      {/* Sticky Week Tray */}
      <WeekTray 
        slots={weekSlots} 
        meals={meals} 
        onRemove={handleRemoveFromTray}
        isShopMode={viewMode === 'shop'}
        onShopToggle={() => setViewMode(prev => prev === 'shop' ? 'dashboard' : 'shop')}
        onClear={handleClearWeek}
        onUserClick={() => setIsUserMenuOpen(true)}
        onDayClick={(index) => setViewingDayIndex(index)}
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
        <div className="pt-48 space-y-6 animate-in fade-in duration-500">
          
          {/* Search Bar */}
          <div className="px-4 sticky top-[136px] z-40 bg-gray-50/95 backdrop-blur-sm pb-2 pt-1 transition-all">
            <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search title, ingredients, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none text-base"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
          </div>

          {searchQuery ? (
             /* Search Results View */
             <section className="px-4 pb-20 max-w-5xl mx-auto">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Found {filteredMeals.length} result{filteredMeals.length !== 1 ? 's' : ''}
                </h2>
                
                {filteredMeals.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMeals.map(meal => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                tier={getTier(meal.lastCooked)}
                                onAdd={setSelectingDayForMeal}
                                onView={setViewingMeal}
                                fluid={true} // Use fluid layout for grid
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 mb-2">No meals found matching "{searchQuery}"</p>
                        <button 
                            onClick={() => setSearchQuery('')} 
                            className="text-brand-600 font-medium hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}
             </section>
          ) : (
             /* Standard 3-Tier View */
             <div className="space-y-8">
                {/* Row 1: High Rotation */}
                <section className="pl-4">
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                        Heavy Hitters <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Last 14 Days</span>
                    </h2>
                    <div className="flex overflow-x-auto space-x-4 pb-4 pr-4 snap-x no-scrollbar">
                    {highTier.length > 0 ? highTier.map(meal => (
                        <MealCard key={meal.id} meal={meal} tier="high" onAdd={setSelectingDayForMeal} onView={setViewingMeal} />
                    )) : (
                        <div className="h-[340px] w-[280px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                            No recent meals
                        </div>
                    )}
                    </div>
                </section>

                {/* Row 2: Medium Rotation */}
                <section className="pl-4 bg-gray-50/50">
                    <h2 className="text-lg font-bold mb-3 text-slate-700">The Bench</h2>
                    <div className="flex overflow-x-auto space-x-4 pb-4 pr-4 snap-x no-scrollbar">
                    {mediumTier.map(meal => (
                        <MealCard key={meal.id} meal={meal} tier="medium" onAdd={setSelectingDayForMeal} onView={setViewingMeal} />
                    ))}
                    </div>
                </section>

                {/* Row 3: The Archive */}
                <section className="pl-4">
                    <h2 className="text-lg font-bold mb-3 text-slate-600">The Archive</h2>
                    <div className="flex overflow-x-auto space-x-4 pb-8 pr-4 snap-x no-scrollbar">
                    {lowTier.map(meal => (
                        <MealCard key={meal.id} meal={meal} tier="low" onAdd={setSelectingDayForMeal} onView={setViewingMeal} />
                    ))}
                    </div>
                </section>
            </div>
          )}

        </div>
      )}

      {/* Floating Action Button & Family Mode Toggle */}
      {viewMode === 'dashboard' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 items-end z-40">
           {/* Family Vote Button */}
           <button 
            onClick={() => setViewMode('voting')}
            className="bg-white text-brand-900 p-3 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform"
            title="Kids Vote Mode"
          >
            <Users size={24} />
          </button>

          {/* Add Meal FAB */}
          <button 
            onClick={openAddModal}
            className="bg-black text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {/* Modals */}
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
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Day Selector Modal */}
      {selectingDayForMeal && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectingDayForMeal(null)} />
            <div className="relative z-10 w-full max-w-sm bg-white p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-200 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Add to which day?</h3>
                    <button onClick={() => setSelectingDayForMeal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {FULL_DAYS.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                handleAddToTray(selectingDayForMeal, index);
                                setSelectingDayForMeal(null);
                            }}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-brand-500 hover:bg-brand-50 transition-all active:scale-95"
                        >
                            <span className="text-sm font-bold text-gray-700">{day}</span>
                            <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 font-medium">
                                {weekSlots[index]?.mealIds.length || 0}
                            </span>
                        </button>
                    ))}
                    
                    {/* Auto Assign Button */}
                    {/* Auto Assign Button */}
                    <button
                        onClick={() => {
                            handleAddToTray(selectingDayForMeal);
                            setSelectingDayForMeal(null);
                        }}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-50 border-2 border-brand-100 text-brand-700 hover:bg-brand-100 transition-all active:scale-95 col-span-2" // Span full width? or keep as last item
                    >
                        <span className="text-sm font-bold">Auto Assign</span>
                        <span className="text-xs opacity-60">Next Empty Slot</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Day Details Modal (View Menu) */}
      {viewingDayIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setViewingDayIndex(null)} />
            <div className="relative z-10 w-full max-w-sm bg-white p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-bottom duration-200 m-4 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-none">
                    <h3 className="font-bold text-lg text-gray-800">{FULL_DAYS[viewingDayIndex]}'s Menu</h3>
                    <button onClick={() => setViewingDayIndex(null)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
                    {weekSlots[viewingDayIndex].mealIds.length > 0 ? (
                        weekSlots[viewingDayIndex].mealIds.map((mealId, idx) => { // Use idx for unique key if duplicate meals allowed
                            const meal = meals.find(m => m.id === mealId);
                            if (!meal) return null;
                            return (
                                <div key={`${mealId}-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={meal.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-800 truncate">{meal.title}</p>
                                        <p className="text-xs text-gray-500">{meal.protein}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveFromTray(viewingDayIndex, mealId)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove from day"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <p>No meals planned for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* User Menu Modal (Centered) */}
      {isUserMenuOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUserMenuOpen(false)} />
            
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <UserCircle className="text-brand-600" size={20} />
                        Settings
                    </h3>
                    <button onClick={() => setIsUserMenuOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-2 space-y-1">
                    {user ? (
                        <div className="px-4 py-3 bg-brand-50 mx-2 mt-2 rounded-xl mb-3">
                            <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-sm font-medium text-brand-900 truncate">{user.email}</p>
                            <div className="text-[10px] text-brand-500 mt-1 flex items-center gap-1">
                                <Database size={10} /> 
                                <span>Data is syncing to <b>user_data</b> table</span>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-4 bg-gray-50 mx-2 mt-2 rounded-xl mb-3 border border-dashed border-gray-200 text-center">
                            <p className="text-sm text-gray-500 mb-3">Sign in to sync your meals across devices and keep them safe.</p>
                            <button 
                                onClick={() => { setIsUserMenuOpen(false); setIsAuthModalOpen(true); }}
                                className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors"
                            >
                                Sign In / Create Account
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => { handleCleanupStorage(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Database size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Free Up Space (Delete Scans)</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                    </button>

                    <button 
                        onClick={() => handleRemoveDefaults(setIsUserMenuOpen)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <Trash2 size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Remove Example Meals</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                    </button>

                     {user && (
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl flex items-center justify-between group transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                    <LogOut size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Sign Out</span>
                            </div>
                        </button>
                     )}
                </div>
                
                <div className="p-3 text-center text-[10px] text-gray-400 bg-gray-50 border-t border-gray-100">
                    The Rotation v1.0
                </div>
            </div>
         </div>
      )}

    </div>
  );
}

export default App;
