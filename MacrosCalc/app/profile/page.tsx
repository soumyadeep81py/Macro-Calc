'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  calculateBMR,
  calculateDailyCalories,
  getActivityLabel,
  type Gender,
  type ActivityLevel,
} from '@/lib/calorieCalculator';
import {
  getWeeklyData,
  getUserProfile,
  saveUserProfile,
  useCalorieContext,
  clearTodayLogs,
  clearAllLogs,
  type UserProfile,
} from '@/lib/calorieStore';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    calorieGoal: 2000,
  });
  const [weeklyData, setWeeklyData] = useState<{ date: string; calories: number; label: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { refreshKey, refresh } = useCalorieContext();
  const { user, signOut } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoadingConfig(true);
      const [fetchedProfile, fetchedWeeklyData] = await Promise.all([
        getUserProfile(user.id),
        getWeeklyData(user.id)
      ]);
      setProfile(fetchedProfile);
      setWeeklyData(fetchedWeeklyData);
      setLoadingConfig(false);
    }
    loadData();
  }, [refreshKey, user]);

  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateDailyCalories(bmr, profile.activityLevel);
  const maxWeekly = Math.max(...weeklyData.map((d) => d.calories), profile.calorieGoal, 1);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    await saveUserProfile(user.id, profile);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
  };

  const handleUseTDEE = () => {
    setProfile((p) => ({ ...p, calorieGoal: tdee }));
  };

  const handleClearToday = async () => {
    if (user && confirm('Are you sure you want to clear today\'s logs?')) {
      await clearTodayLogs(user.id);
      refresh();
    }
  };

  const handleClearAll = async () => {
    if (user && confirm('Are you sure you want to completely clear your history? This cannot be undone.')) {
      await clearAllLogs(user.id);
      refresh();
    }
  };

  return (
    <AuthGuard>
      <div className={`space-y-8 transition-opacity duration-300 ${loadingConfig ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-ellipsis overflow-hidden">
            PROFILE: {user?.email}
          </h1>
          <Button variant="danger" size="sm" onClick={signOut}>
            LOGOUT
          </Button>
        </div>

        {/* Weekly Chart */}
        <Card>
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">WEEKLY OVERVIEW</h2>
        <div className="flex items-end gap-3 h-48">
          {weeklyData.map((day, i) => {
            const height = maxWeekly > 0 ? (day.calories / maxWeekly) * 100 : 0;
            const isToday = i === weeklyData.length - 1;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span
                  className="text-xs font-mono font-bold"
                  style={{ fontFamily: 'var(--font-jetbrains), monospace' }}
                >
                  {day.calories > 0 ? day.calories : '—'}
                </span>
                <div className="w-full relative" style={{ height: '140px' }}>
                  <div
                    className={`absolute bottom-0 w-full border-3 border-black transition-all duration-500 ${
                      isToday ? 'bg-[#FFD600]' : 'bg-[#2979FF]'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${isToday ? 'text-[#FF4D00]' : 'opacity-60'}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Goal line indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-4 h-1 bg-[#FFD600] border border-black" />
          <span className="opacity-60">Today</span>
          <div className="w-4 h-1 bg-[#2979FF] border border-black ml-4" />
          <span className="opacity-60">Past Days</span>
        </div>
      </Card>

      {/* BMR Calculator */}
      <Card>
        <h2 className="text-xl font-bold mb-6 uppercase tracking-wide">BMR CALCULATOR</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Weight (kg)"
            type="number"
            value={profile.weight}
            onChange={(e) => setProfile((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
            id="profile-weight"
          />
          <Input
            label="Height (cm)"
            type="number"
            value={profile.height}
            onChange={(e) => setProfile((p) => ({ ...p, height: parseFloat(e.target.value) || 0 }))}
            id="profile-height"
          />
          <Input
            label="Age"
            type="number"
            value={profile.age}
            onChange={(e) => setProfile((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
            id="profile-age"
          />

          {/* Gender */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm uppercase tracking-wide">Gender</label>
            <div className="flex gap-2">
              {(['male', 'female'] as Gender[]).map((g) => (
                <Button
                  key={g}
                  variant={profile.gender === g ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setProfile((p) => ({ ...p, gender: g }))}
                  id={`gender-${g}`}
                >
                  {g === 'male' ? 'MALE' : 'FEMALE'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="mt-4">
          <label className="font-bold text-sm uppercase tracking-wide mb-2 block">Activity Level</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(['sedentary', 'light', 'moderate', 'active'] as ActivityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setProfile((p) => ({ ...p, activityLevel: level }))}
                className={`text-left p-3 border-3 border-black font-bold transition-colors cursor-pointer ${
                  profile.activityLevel === level ? 'bg-[#FFD600]' : 'bg-white hover:bg-[#F7F7F7]'
                }`}
                id={`activity-${level}`}
              >
                {getActivityLabel(level)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card color="#E8F5E9">
            <p className="text-sm font-bold uppercase opacity-60">BMR</p>
            <p
              className="text-3xl font-bold font-mono"
              style={{ fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              {bmr}
            </p>
            <p className="text-sm opacity-60">kcal/day (at rest)</p>
          </Card>
          <Card color="#FFD600">
            <p className="text-sm font-bold uppercase opacity-60">TDEE</p>
            <p
              className="text-3xl font-bold font-mono"
              style={{ fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              {tdee}
            </p>
            <p className="text-sm opacity-60">kcal/day (your activity)</p>
          </Card>
        </div>
      </Card>

      {/* Goal Settings */}
      <Card>
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">CALORIE GOAL</h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Daily Calorie Goal (kcal)"
              type="number"
              value={profile.calorieGoal}
              onChange={(e) =>
                setProfile((p) => ({ ...p, calorieGoal: parseInt(e.target.value) || 0 }))
              }
              id="calorie-goal"
            />
          </div>
          <Button variant="accent" onClick={handleUseTDEE} size="sm">
            Use TDEE ({tdee})
          </Button>
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveProfile} className={saved ? 'bg-green-400' : ''} disabled={isSaving}>
            {saved ? 'SAVED!' : isSaving ? 'SAVING...' : 'SAVE PROFILE & GOAL'}
          </Button>
        </div>

        <div className="mt-4 text-sm opacity-60">
          <p><strong>Tip:</strong> To lose weight, eat 300-500 kcal below your TDEE.</p>
          <p>To gain weight, eat 300-500 kcal above your TDEE.</p>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card color="#FCE4EC" className="border-red-500">
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wide text-red-600">DANGER ZONE</h2>
        <p className="text-sm opacity-80 mb-6">
          Reset your progress here. Be careful!
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="danger" onClick={handleClearToday}>
            CLEAR TODAY&apos;S LOGS
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            CLEAR ALL HISTORY
          </Button>
        </div>
      </Card>
      </div>
    </AuthGuard>
  );
}
