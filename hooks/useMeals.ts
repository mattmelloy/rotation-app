import { useState, useEffect } from 'react';
import { Meal, DaySlot, DAYS } from '../types';
import { INITIAL_MEALS } from '../constants';
import { ToastType } from '../components/Toast';

export function useMeals(showToast: (msg: string, type: ToastType) => void) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weekSlots, setWeekSlots] = useState<DaySlot[]>([]);
  const [shopChecked, setShopChecked] = useState<string[]>([]);

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
    // Load Local Data First
    const savedMeals = localStorage.getItem('rotation_meals');
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    } else {
      setMeals(INITIAL_MEALS);
      safeSetItem('rotation_meals', JSON.stringify(INITIAL_MEALS));
    }

    // Load Week Plan
    const savedSlots = localStorage.getItem('rotation_week');
    if (savedSlots) {
      setWeekSlots(JSON.parse(savedSlots));
    } else {
      const initialSlots = DAYS.map(d => ({ label: d, mealId: null }));
      setWeekSlots(initialSlots);
    }

    // Load Shopping List
    const savedShop = localStorage.getItem('rotation_shop_checked');
    if (savedShop) {
      setShopChecked(JSON.parse(savedShop));
    }
  }, []);

  // --- Persistence Listeners (Local Storage) ---
  useEffect(() => {
    if (meals.length > 0) {
        safeSetItem('rotation_meals', JSON.stringify(meals));
    }
  }, [meals]);

  useEffect(() => {
    if (weekSlots.length > 0) {
        safeSetItem('rotation_week', JSON.stringify(weekSlots));
    }
  }, [weekSlots]);

  useEffect(() => {
    safeSetItem('rotation_shop_checked', JSON.stringify(shopChecked));
  }, [shopChecked]);

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
