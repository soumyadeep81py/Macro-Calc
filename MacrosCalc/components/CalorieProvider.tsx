'use client';

import { useState, type ReactNode } from 'react';
import { CalorieContext } from '@/lib/calorieStore';

export function CalorieProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <CalorieContext.Provider value={{ refreshKey, refresh }}>
      {children}
    </CalorieContext.Provider>
  );
}
