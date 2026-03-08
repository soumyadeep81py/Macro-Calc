'use client';

import { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Interfaces ──────────────────────────────────────────────

export interface FoodLogEntry {
  id: string;
  foodName: string;
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface UserProfile {
  username?: string;
  weight: number; 
  height: number; 
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  calorieGoal: number;
}

export const DEFAULT_PROFILE: UserProfile = {
  weight: 70,
  height: 170,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  calorieGoal: 2000,
};

export interface CustomFood {
  id?: string;
  name: string;
  calories_per_100g: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

// ─── Helpers ───────────────────────────────────────────────

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Custom Foods ──────────────────────────────────────────

export async function getCustomFoods(userId: string): Promise<CustomFood[]> {
  const { data, error } = await supabase
    .from('custom_foods')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching custom foods:', error);
    return [];
  }
  return data || [];
}

export async function addCustomFood(userId: string, food: CustomFood): Promise<void> {
  // Try to find if it exists
  const foods = await getCustomFoods(userId);
  const existing = foods.find(f => f.name.toLowerCase() === food.name.toLowerCase());
  
  if (existing) {
    await supabase
      .from('custom_foods')
      .update(food)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('custom_foods')
      .insert({ ...food, user_id: userId });
  }
}

// ─── Food log functions ────────────────────────────────────

export async function getAllLogs(userId: string): Promise<FoodLogEntry[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  
  return data.map(log => ({
    id: log.id,
    foodName: log.food_name,
    weightGrams: log.weight_grams,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    date: log.date,
    created_at: log.created_at
  }));
}

export async function getLogsForDate(userId: string, date: string): Promise<FoodLogEntry[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching logs for date:', error);
    return [];
  }
  
  return data.map(log => ({
    id: log.id,
    foodName: log.food_name,
    weightGrams: log.weight_grams,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    date: log.date,
    created_at: log.created_at
  }));
}

export async function getTodayLogs(userId: string): Promise<FoodLogEntry[]> {
  return getLogsForDate(userId, getTodayKey());
}

export async function addFoodLog(userId: string, entry: Omit<FoodLogEntry, 'id' | 'created_at' | 'date'>): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .insert({
      user_id: userId,
      food_name: entry.foodName,
      weight_grams: entry.weightGrams,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      date: getTodayKey(),
    });
    
  if (error) {
    console.error('Error adding log:', error);
    if (typeof window !== 'undefined') {
      alert(`Supabase Error: ${error.message} \\nDetails: ${error.details || ''} \\nHint: ${error.hint || ''}`);
    }
  }
}

export async function deleteFoodLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', id);
    
  if (error) console.error('Error deleting log:', error);
}

export async function clearTodayLogs(userId: string): Promise<void> {
  const today = getTodayKey();
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', userId)
    .eq('date', today);
    
  if (error) console.error('Error clearing today logs:', error);
}

export async function clearAllLogs(userId: string): Promise<void> {
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', userId);
    
  if (error) console.error('Error clearing all logs:', error);
}

export async function getDailyTotal(userId: string, date: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const logs = await getLogsForDate(userId, date);
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + Number(log.calories),
      protein: acc.protein + Number(log.protein),
      carbs: acc.carbs + Number(log.carbs),
      fat: acc.fat + Number(log.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export async function getWeeklyData(userId: string): Promise<{ date: string; calories: number; label: string }[]> {
  const days: { date: string; calories: number; label: string }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const total = await getDailyTotal(userId, dateKey);
    days.push({
      date: dateKey,
      calories: total.calories,
      label: dayNames[d.getDay()],
    });
  }
  return days;
}

// ─── User Profile ──────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error || !data) {
    if (error?.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching profile:', error);
    } else {
      // Self-heal: Create the missing profile to satisfy foreign key constraints
      await saveUserProfile(userId, DEFAULT_PROFILE);
    }
    return DEFAULT_PROFILE;
  }
  
  return {
    username: data.username,
    weight: data.weight,
    height: data.height,
    age: data.age,
    gender: data.gender,
    activityLevel: data.activity_level,
    calorieGoal: data.calorie_goal,
  };
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      activity_level: profile.activityLevel,
      calorie_goal: profile.calorieGoal,
    });
    
  if (error) console.error('Error saving profile:', error);
}

// ─── Context (for triggering re-renders) ───────────────────

export interface CalorieContextType {
  refreshKey: number;
  refresh: () => void;
}

export const CalorieContext = createContext<CalorieContextType>({
  refreshKey: 0,
  refresh: () => {},
});

export function useCalorieContext() {
  return useContext(CalorieContext);
}
