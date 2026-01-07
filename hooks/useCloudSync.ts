import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  safeSetItem: (key: string, value: string) => void
) {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check Auth Status on Mount & Listen for Changes
  useEffect(() => {
    if (isSupabaseConfigured()) {
        supabase?.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchCloudData(session.user.id);
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchCloudData(session.user.id);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, []);

  // 2. Fetch Data from Cloud
  const fetchCloudData = async (userId: string) => {
    try {
        const { data, error } = await supabase!
            .from('user_data')
            .select('meals, week_slots, shopping_list')
            .eq('user_id', userId)
            .single();
        
        if (data) {
             // Merging Logic: Cloud wins if data exists
             if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
                 setMeals(data.meals);
                 safeSetItem('rotation_meals', JSON.stringify(data.meals));
             }
             if (data.week_slots && Array.isArray(data.week_slots) && data.week_slots.length > 0) {
                 setWeekSlots(data.week_slots);
                 safeSetItem('rotation_week', JSON.stringify(data.week_slots));
             }
             if (data.shopping_list && Array.isArray(data.shopping_list)) {
                 setShopChecked(data.shopping_list);
                 safeSetItem('rotation_shop_checked', JSON.stringify(data.shopping_list));
             }
        }
    } catch (err) {
        console.error("Error fetching cloud data", err);
    }
  };

  // 3. Save Data to Cloud
  // Note: This replaces the entire row. In v2, consider granular updates or optimistic concurrency control.
  const saveToCloud = useCallback(async (currentMeals: Meal[], currentSlots: DaySlot[], currentShop: string[]) => {
    if (!user || !isSupabaseConfigured()) return;
    
    try {
        const { error } = await supabase!.from('user_data').upsert({
            user_id: user.id,
            meals: currentMeals,
            week_slots: currentSlots,
            shopping_list: currentShop,
            updated_at: new Date().toISOString()
        });

        if (error) throw error;
        console.log("Synced to Supabase successfully");
    } catch (err: any) {
        console.error("Cloud save failed", err);
        showToast(`Sync failed: ${err.message}`, "error");
    }
  }, [user, showToast]);

  // Sync listeners
  useEffect(() => {
    if (user && meals.length > 0) saveToCloud(meals, weekSlots, shopChecked);
  }, [meals]);

  useEffect(() => {
    if (user && weekSlots.length > 0) saveToCloud(meals, weekSlots, shopChecked);
  }, [weekSlots]);

  useEffect(() => {
    if (user) saveToCloud(meals, weekSlots, shopChecked);
  }, [shopChecked]);

  return {
    user,
    setUser, // Exposed for logout
    isAuthModalOpen,
    setIsAuthModalOpen,
    saveToCloud, // Exposed for manual sync if needed
    isLoading
  };
}
