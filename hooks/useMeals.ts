import { useState, useEffect } from 'react';
import { Meal, DaySlot, DAYS } from '../types';
import { INITIAL_MEALS } from '../constants';
import { ToastType } from '../components/Toast';
import { getItem, setItem } from '../lib/storage';

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

  const safeSetItem = async (key: string, value: string) => {
    try {
      await setItem(key, value);
    } catch (e) {
      console.error("Storage Error", e);
      showToast("Storage Full! Please delete some meals or use smaller images.", "error");
    }
  };

  // --- Initialization ---
  useEffect(() => {
    setIsInitialized(false);
    
    const loadData = async () => {
        try {
            // Load Local Data First
            const mealsKey = getStorageKey('meals');
            
            // Try IndexedDB first
            let savedMeals = await getItem(mealsKey);
            
            // Migration: Check localStorage if not in IndexedDB
            if (!savedMeals) {
                const localMeals = localStorage.getItem(mealsKey);
                if (localMeals) {
                    savedMeals = localMeals;
                    await setItem(mealsKey, localMeals); // Migrate to IndexedDB
                }
            }

            if (savedMeals) {
                setMeals(JSON.parse(savedMeals));
            } else if (isGuest) {
                // Only set initial meals for guests
                setMeals(INITIAL_MEALS);
                await safeSetItem(mealsKey, JSON.stringify(INITIAL_MEALS));
            } else {
                // For logged-in users, start empty and let cloud sync populate
                setMeals([]);
            }

            // Load Week Plan
            const weekKey = getStorageKey('week');
            let savedSlots = await getItem(weekKey);
            
            if (!savedSlots) {
                const localSlots = localStorage.getItem(weekKey);
                if (localSlots) {
                    savedSlots = localSlots;
                    await setItem(weekKey, localSlots);
                }
            }

            if (savedSlots) {
                // Migration: Convert old single-meal format to new array format if needed
                const loaded = JSON.parse(savedSlots);
                const migrated = loaded.map((s: any) => ({
                    label: s.label,
                    mealIds: Array.isArray(s.mealIds) ? s.mealIds : (s.mealId ? [s.mealId] : [])
                }));
                setWeekSlots(migrated);
            } else {
                const initialSlots = DAYS.map(d => ({ label: d, mealIds: [] }));
                setWeekSlots(initialSlots);
            }

            // Load Shopping List
            const shopKey = getStorageKey('shop');
            let savedShop = await getItem(shopKey);
            
            if (!savedShop) {
                const localShop = localStorage.getItem(shopKey);
                if (localShop) {
                    savedShop = localShop;
                    await setItem(shopKey, localShop);
                }
            }

            if (savedShop) {
                setShopChecked(JSON.parse(savedShop));
            } else {
                setShopChecked([]);
            }
        } catch (err) {
            console.error("Failed to load data", err);
            showToast("Error loading saved data", "error");
        } finally {
            // Mark as initialized after a brief delay to allow cloud sync to take over
            setTimeout(() => setIsInitialized(true), 100);
        }
    };

    loadData();
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
  const handleAddToTray = (meal: Meal, targetIndex?: number) => {
    // 1. Direct Add (Manual Selection)
    if (targetIndex !== undefined) {
        if (targetIndex >= 0 && targetIndex < weekSlots.length) {
             const newSlots = [...weekSlots];
             // Limit check (optional, but good for UI sanity)
             if (newSlots[targetIndex].mealIds.length >= 6) {
                 showToast("Day is full (max 6 items)", "error");
                 return;
             }
             newSlots[targetIndex] = { 
                 ...newSlots[targetIndex], 
                 mealIds: [...newSlots[targetIndex].mealIds, meal.id] 
             };
             setWeekSlots(newSlots);
             showToast(`Added ${meal.title} to ${newSlots[targetIndex].label}`, 'success');
        }
        return;
    }

    // 2. Auto Add (Original Logic)
    // Find first day with 0 meals, otherwise append to first day with < 3 meals
    let autoIndex = weekSlots.findIndex(s => s.mealIds.length === 0);
    
    // If all days have at least one meal, look for days with < 3 meals
    if (autoIndex === -1) {
        autoIndex = weekSlots.findIndex(s => s.mealIds.length < 3);
    }

    if (autoIndex !== -1) {
      const newSlots = [...weekSlots];
      newSlots[autoIndex] = { 
          ...newSlots[autoIndex], 
          mealIds: [...newSlots[autoIndex].mealIds, meal.id] 
      };
      setWeekSlots(newSlots);
      showToast(`Added ${meal.title} to ${newSlots[autoIndex].label}`, 'success');
    } else {
      showToast("Your week is getting full! Try removing some meals.", "error");
    }
  };

  const handleRemoveFromTray = (dayIndex: number, mealIdToRemove?: string) => {
    const newSlots = [...weekSlots];
    if (mealIdToRemove) {
        // Remove specific meal
        newSlots[dayIndex] = {
            ...newSlots[dayIndex],
            mealIds: newSlots[dayIndex].mealIds.filter(id => id !== mealIdToRemove)
        };
    } else {
        // Clear entire day
        newSlots[dayIndex] = { ...newSlots[dayIndex], mealIds: [] };
    }
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
    // Also remove from tray if present (filter out the deleted ID)
    setWeekSlots(prev => prev.map(slot => ({
        ...slot,
        mealIds: slot.mealIds.filter(mid => mid !== id)
    })));
    showToast("Meal deleted", "info");
  };

  const handleClearWeek = () => {
    if (window.confirm("Start a new week? This will clear the current menu and reset all family vote counts.")) {
        // 1. Clear tray
        setWeekSlots(DAYS.map(d => ({ label: d, mealIds: [] })));
        
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
          
          // Clean up tray by filtering out default IDs
          setWeekSlots(prev => prev.map(slot => ({
              ...slot,
              mealIds: slot.mealIds.filter(mid => !defaultIds.includes(mid))
          })));

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

  const handleCleanupStorage = () => {
    if (window.confirm("This will permanently delete all original recipe scans (source images) from your history to free up space. The recipes themselves will be kept. Continue?")) {
        let count = 0;
        const newMeals = meals.map(m => {
            if (m.sourceImage) {
                count++;
                const { sourceImage, ...rest } = m;
                return rest as Meal;
            }
            return m;
        });
        
        if (count > 0) {
            setMeals(newMeals);
            showToast(`Removed ${count} scanned images. Syncing...`, 'success');
        } else {
            showToast("No scanned images found to clean.", 'info');
        }
    }
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
      handleShopToggle,
      handleCleanupStorage
  };
}
