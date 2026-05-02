import { useState, useEffect, useCallback, useRef } from 'react';
import { getMe, fetchUserData, saveUserData, isAuthenticated, signOut, AuthUser } from '../lib/api';
import { Meal, DaySlot } from '../types';
import { ToastType } from '../components/Toast';

export function useCloudSync(
  meals: Meal[],
  weekSlots: DaySlot[],
  shopChecked: string[],
  setMeals: (meals: Meal[]) => void,
  setWeekSlots: (slots: DaySlot[]) => void,
  setShopChecked: (checked: string[]) => void,
  showToast: (msg: string, type: ToastType) => void,
  safeSetItem: (key: string, value: string) => void,
  isGuest: boolean
) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSyncInitialized, setIsCloudSyncInitialized] = useState(false);
  const isFetchingRef = useRef(false);

  // 1. Check Auth Status on Mount
  useEffect(() => {
    if (isAuthenticated()) {
      getMe().then(({ data, error }) => {
        if (data?.user) {
          setUser(data.user);
          fetchCloudData(data.user.id);
        } else {
          // Token expired or invalid — clear it
          signOut();
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Data from Cloud
  const fetchCloudData = async (userId: string) => {
    if (isFetchingRef.current) return; // Prevent duplicate fetches
    isFetchingRef.current = true;
    setIsCloudSyncInitialized(false);

    try {
        const { data, error } = await fetchUserData();
        
        if (data) {
             // Cloud data wins - completely replace local state
             if (data.meals && Array.isArray(data.meals)) {
                 setMeals(data.meals);
                 safeSetItem(`rotation_user_${userId}_meals`, JSON.stringify(data.meals));
             } else {
                 setMeals([]);
             }
             
             if (data.week_slots && Array.isArray(data.week_slots)) {
                 // Migration: Ensure new format (array of mealIds)
                 const migratedSlots = data.week_slots.map((s: any) => ({
                    label: s.label,
                    mealIds: Array.isArray(s.mealIds) ? s.mealIds : (s.mealId ? [s.mealId] : [])
                 }));
                 setWeekSlots(migratedSlots);
                 safeSetItem(`rotation_user_${userId}_week`, JSON.stringify(migratedSlots));
             }
             
             if (data.shopping_list && Array.isArray(data.shopping_list)) {
                 setShopChecked(data.shopping_list);
                 safeSetItem(`rotation_user_${userId}_shop`, JSON.stringify(data.shopping_list));
             } else {
                 setShopChecked([]);
             }
        } else if (error) {
            console.log("No cloud data found for user, starting fresh");
        }
    } catch (err) {
        console.error("Error fetching cloud data", err);
    } finally {
        // Mark as initialized after fetching so sync can begin
        setTimeout(() => {
            setIsCloudSyncInitialized(true);
            isFetchingRef.current = false;
        }, 200);
    }
  };

  // 3. Save Data to Cloud
  const saveToCloud = useCallback(async (currentMeals: Meal[], currentSlots: DaySlot[], currentShop: string[]) => {
    if (!user || isGuest || !isCloudSyncInitialized) return;
    
    try {
        const { error } = await saveUserData({
            meals: currentMeals,
            week_slots: currentSlots,
            shopping_list: currentShop,
        });

        if (error) throw new Error(error);
        console.log("Synced to cloud successfully");
    } catch (err: any) {
        console.error("Cloud save failed", err);
        showToast(`Sync failed: ${err.message}`, "error");
    }
  }, [user, showToast, isGuest, isCloudSyncInitialized]);

  // Sync listeners - only sync after cloud initialization is complete
  useEffect(() => {
    if (user && !isGuest && isCloudSyncInitialized && meals.length > 0) {
        saveToCloud(meals, weekSlots, shopChecked);
    }
  }, [meals, isCloudSyncInitialized]);

  useEffect(() => {
    if (user && !isGuest && isCloudSyncInitialized && weekSlots.length > 0) {
        saveToCloud(meals, weekSlots, shopChecked);
    }
  }, [weekSlots, isCloudSyncInitialized]);

  useEffect(() => {
    if (user && !isGuest && isCloudSyncInitialized) {
        saveToCloud(meals, weekSlots, shopChecked);
    }
  }, [shopChecked, isCloudSyncInitialized]);

  return {
    user,
    setUser, // Exposed for logout
    isAuthModalOpen,
    setIsAuthModalOpen,
    saveToCloud, // Exposed for manual sync if needed
    isLoading
  };
}
