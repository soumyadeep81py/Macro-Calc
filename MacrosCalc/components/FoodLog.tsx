'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { getTodayLogs, deleteFoodLog, useCalorieContext, type FoodLogEntry } from '@/lib/calorieStore';
import { useAuth } from '@/components/AuthProvider';

export default function FoodLog() {
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshKey, refresh } = useCalorieContext();
  const { user } = useAuth();

  useEffect(() => {
    async function loadLogs() {
      if (!user) return;
      setIsLoading(true);
      const todayLogs = await getTodayLogs(user.id);
      setLogs(todayLogs);
      setIsLoading(false);
    }
    loadLogs();
  }, [refreshKey, user]);

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    await deleteFoodLog(id);
    refresh();
  };

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">TODAY'S LOG</h2>
        <div className="text-center py-8 opacity-50 font-bold animate-pulse">
          Loading logs...
        </div>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">TODAY'S LOG</h2>
        <div className="text-center py-8 opacity-50">
          <p className="font-bold">No food logged yet</p>
          <p className="text-sm mt-1">Start by adding your first meal above!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">TODAY'S LOG</h2>
      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-3 bg-[#F7F7F7] border-3 border-black hover:bg-[#FFD600]/20 transition-colors group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold capitalize">{log.foodName.replace(' (whole)', '')}</span>
                <span className="text-xs opacity-60 font-mono">
                  {log.weightGrams}{log.foodName.endsWith('(whole)') ? ' whole' : 'g'}
                </span>
              </div>
              <div className="text-xs font-mono opacity-60 mt-0.5">
                P:{log.protein}g · C:{log.carbs}g · F:{log.fat}g
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-lg">{log.calories}</span>
              <span className="text-xs opacity-60">kcal</span>
              <button
                onClick={() => handleDelete(log.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF4D00] text-white border-2 border-black w-7 h-7 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600"
                aria-label={`Delete ${log.foodName}`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t-3 border-black flex justify-between font-bold">
        <span>Total</span>
        <span className="font-mono text-lg">
          {logs.reduce((sum, l) => sum + l.calories, 0)} kcal
        </span>
      </div>
    </Card>
  );
}
