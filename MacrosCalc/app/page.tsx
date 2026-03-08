'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import FoodForm from '@/components/FoodForm';
import FoodLog from '@/components/FoodLog';
import { getDailyTotal, getTodayKey, getUserProfile, useCalorieContext } from '@/lib/calorieStore';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goal, setGoal] = useState(2000);
  const [loadingData, setLoadingData] = useState(true);
  const { refreshKey } = useCalorieContext();
  const { user } = useAuth();

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      setLoadingData(true);
      const [fetchedTotals, profile] = await Promise.all([
        getDailyTotal(user.id, getTodayKey()),
        getUserProfile(user.id)
      ]);
      setTotals(fetchedTotals);
      setGoal(profile.calorieGoal);
      setLoadingData(false);
    }
    
    loadStats();
  }, [refreshKey, user]);

  const remaining = Math.max(0, goal - totals.calories);
  const progress = Math.min(100, (totals.calories / goal) * 100);
  const isOverGoal = totals.calories > goal;

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            CALORIES TODAY
          </h1>
        <p className="text-sm opacity-60 mt-1 font-medium">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Calorie Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${loadingData ? 'opacity-50' : 'opacity-100'}`}>
        <Card color="#FFD600" className="card-hover">
          <p className="text-sm font-bold uppercase tracking-wide opacity-70">Consumed</p>
          <p className="text-4xl font-bold font-mono mt-1" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {totals.calories}
          </p>
          <p className="text-sm font-bold opacity-70">kcal</p>
        </Card>

        <Card color={isOverGoal ? '#FF4D00' : '#FFFFFF'} className="card-hover">
          <p className={`text-sm font-bold uppercase tracking-wide ${isOverGoal ? 'text-white opacity-80' : 'opacity-70'}`}>
            {isOverGoal ? 'Over by' : 'Remaining'}
          </p>
          <p
            className={`text-4xl font-bold font-mono mt-1 ${isOverGoal ? 'text-white' : ''}`}
            style={{ fontFamily: 'var(--font-jetbrains), monospace' }}
          >
            {isOverGoal ? totals.calories - goal : remaining}
          </p>
          <p className={`text-sm font-bold ${isOverGoal ? 'text-white opacity-80' : 'opacity-70'}`}>kcal</p>
        </Card>

        <Card className="card-hover">
          <p className="text-sm font-bold uppercase tracking-wide opacity-70">Daily Goal</p>
          <p className="text-4xl font-bold font-mono mt-1" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {goal}
          </p>
          <p className="text-sm font-bold opacity-70">kcal</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-sm uppercase tracking-wide">Progress</span>
          <span className="font-mono font-bold" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-8 bg-[#F7F7F7] border-3 border-black overflow-hidden">
          <div
            className={`h-full transition-all duration-500 animate-fill ${
              isOverGoal ? 'bg-[#FF4D00]' : progress > 80 ? 'bg-[#FFD600]' : 'bg-[#2979FF]'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </Card>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4">
        <Card color="#E8F5E9" className="card-hover text-center">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">Protein</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {Math.round(totals.protein)}g
          </p>
        </Card>
        <Card color="#FFF3E0" className="card-hover text-center">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">Carbs</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {Math.round(totals.carbs)}g
          </p>
        </Card>
        <Card color="#FCE4EC" className="card-hover text-center">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">Fat</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
            {Math.round(totals.fat)}g
          </p>
        </Card>
      </div>

      {/* Quick Add + Food Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FoodForm />
        <FoodLog />
        </div>
      </div>
    </AuthGuard>
  );
}
