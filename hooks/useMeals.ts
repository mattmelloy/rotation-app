import { useState, useEffect } from 'react';
import { Meal, DaySlot, DAYS } from '../types';
import { INITIAL_MEALS } from '../constants';
import { ToastType } from '../components/Toast';

interface UseMealsParams {
  showToast: (msg: string, type: ToastType) => void;
  isGuest: boolean;
  userId: string | null;
}

export function useMeals({ showToast, isGuest, userId }: UseMealsParams) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weekSlots, setWeekSlots] = useState<DaySlot[]>([]);
  const [shopChecked, setShopChecked] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine storage keys based on mode
  const getStorageKey = (type: 'meals' | 'week' | 'shop') => {
    if (isGuest) {
      return `rotation_guest_${type}`;
    }
    // For logged-in users, we primarily rely on cloud sync
    // Local storage is only used as a temporary cache
    return userId ? `rotation_user_${userId}_${type}` : `rotation_${type}`;
  };

  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage Error", e);
      showToast("Storage Full! Please delete some meals or use smaller images.", "error");
    }
  };

  // --- Initialization ---
  useEffect(() => {
    setIsInitialized(false);
    
    // Load Local Data First
    const mealsKey = getStorageKey('meals');
    const savedMeals = localStorage.getItem(mealsKey);
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    } else if (isGuest) {
      // Only set initial meals for guests
      setMeals(INITIAL_MEALS);
      safeSetItem(mealsKey, JSON.stringify(INITIAL_MEALS));
    } else {
      // For logged-in users, start empty and let cloud sync populate
      setMeals([]);
    }

    // Load Week Plan
    const weekKey = getStorageKey('week');
    const savedSlots = localStorage.getItem(weekKey);
    if (savedSlots) {
      setWeekSlots(JSON.parse(savedSlots));
    } else {
      const initialSlots = DAYS.map(d => ({ label: d, mealId: null }));
      setWeekSlots(initialSlots);
    }

    // Load Shopping List
    const shopKey = getStorageKey('shop');
    const savedShop = localStorage.getItem(shopKey);
    if (savedShop) {
      setShopChecked(JSON.parse(savedShop));
    } else {
      setShopChecked([]);
    }

    // Mark as initialized after a brief delay to allow cloud sync to take over
    setTimeout(() => setIsInitialized(true), 100);
  }, [isGuest, userId]);

  // --- Persistence Listeners (Local Storage) ---
  // Only persist to localStorage after initialization to avoid race conditions
  useEffect(() => {
    if (isInitialized && meals.length > 0) {
        safeSetItem(getStorageKey('meals'), JSON.stringify(meals));
    }
  }, [meals, isInitialized]);

  useEffect(() => {
    if (isInitialized && weekSlots.length > 0) {
        safeSetItem(getStorageKey('week'), JSON.stringify(weekSlots));
    }
  }, [weekSlots, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
        safeSetItem(getStorageKey('shop'), JSON.stringify(shopChecked));
    }
  }, [shopChecked, isInitialized]);

  // --- Handlers ---
  const handleAddToTray = (meal: Meal) => {
    const firstEmptyIndex = weekSlots.findIndex(s => s.mealId === null);
    if (firstEmptyIndex !== -1) {
      const newSlots = [...weekSlots];
      newSlots[firstEmptyIndex] = { ...newSlots[firstEmptyIndex], mealId: meal.id };
      setWeekSlots(newSlots);
      showToast(`Added ${meal.title} to ${newSlots[firstEmptyIndex].label}`, 'success');
    } else {
      showToast("Your week is full! Remove a meal first.", "error");
    }
  };

  const handleRemoveFromTray = (index: number) => {
    const newSlots = [...weekSlots];
    newSlots[index] = { ...newSlots[index], mealId: null };
    setWeekSlots(newSlots);
  };

  const handleSaveMeal = (mealToSave: Meal, editingMeal: Meal | null, setEditingMeal: (m: Meal | null) => void) => {
    if (editingMeal) {
        // Update existing
        setMeals(prev => prev.map(m => m.id === mealToSave.id ? mealToSave : m));
        setEditingMeal(null);
        showToast("Meal updated successfully", 'success');
    } else {
        // Add new
        setMeals(prev => [mealToSave, ...prev]);
        handleAddToTray(mealToSave); // Auto-add to tray for instant gratification
        showToast("New meal created!", 'success');
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    // Also remove from tray if present
    setWeekSlots(prev => prev.map(slot => slot.mealId === id ? { ...slot, mealId: null } : slot));
    showToast("Meal deleted", "info");
  };

  const handleClearWeek = () => {
    if (window.confirm("Start a new week? This will clear the current menu and reset all family vote counts.")) {
        // 1. Clear tray
        setWeekSlots(DAYS.map(d => ({ label: d, mealId: null })));
        
        // 2. Reset votes on ALL meals
        setMeals(prevMeals => {
            return prevMeals.map(m => ({
                ...m,
                votes: 0
            }));
        });

        // 3. Clear shopping list state
        setShopChecked([]);
        
        showToast("Week cleared and ready for new rotation!", "success");
    }
  };

  const handleRemoveDefaults = (setIsUserMenuOpen: (v: boolean) => void) => {
      if (window.confirm("Remove all example meals (Taco Tuesday, etc.)? This cannot be undone.")) {
          const defaultIds = INITIAL_MEALS.map(m => m.id);
          
          setMeals(prev => prev.filter(m => !defaultIds.includes(m.id)));
          
          // Clean up tray
          setWeekSlots(prev => prev.map(slot => 
              slot.mealId && defaultIds.includes(slot.mealId) 
                  ? { ...slot, mealId: null } 
                  : slot
          ));

          showToast("Example meals removed", "info");
          setIsUserMenuOpen(false);
      }
  };

  const handleShopToggle = (itemId: string) => {
    setShopChecked(prev => {
        if (prev.includes(itemId)) {
            return prev.filter(id => id !== itemId);
        } else {
            return [...prev, itemId];
        }
    });
  };

  return {
      meals, setMeals,
      weekSlots, setWeekSlots,
      shopChecked, setShopChecked,
      safeSetItem,
      handleAddToTray,
      handleRemoveFromTray,
      handleSaveMeal,
      handleDeleteMeal,
      handleClearWeek,
      handleRemoveDefaults,
      handleShopToggle
  };
}
