'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { parseFoodInput, searchFoods, getAllFoods, type FoodItem } from '@/lib/foodParser';
import { calculateCalories } from '@/lib/calorieCalculator';
import { addFoodLog, useCalorieContext, addCustomFood, getCustomFoods } from '@/lib/calorieStore';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';

export default function AddFoodPage() {
  const [mode, setMode] = useState<'quick' | 'manual' | 'browse'>('quick');
  const [quickInput, setQuickInput] = useState('');
  const [manualFood, setManualFood] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [browseWeight, setBrowseWeight] = useState('100');
  const [addedMessage, setAddedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const { refresh, refreshKey } = useCalorieContext();
  const { user } = useAuth();

  const categories = [...new Set(allFoods.map((f) => f.category))];

  useEffect(() => {
    async function initFoods() {
      if (!user) return;
      const customFoods = await getCustomFoods(user.id);
      const foods = getAllFoods(customFoods);
      setAllFoods(foods);
      
      if (searchQuery) {
        setSearchResults(searchFoods(searchQuery, 20, customFoods));
      } else {
        setSearchResults([]);
      }
    }
    initFoods();
  }, [searchQuery, user, refreshKey]);

  const showAddedMessage = (foodName: string, cal: number) => {
    setAddedMessage(`ADDED ${foodName.toUpperCase()} — ${cal} KCAL`);
    setTimeout(() => setAddedMessage(''), 2000);
  };

  const handleQuickAdd = async () => {
    if (!user) return;
    const parsed = parseFoodInput(quickInput, await getCustomFoods(user.id));
    if (!parsed) return;
    
    setIsSubmitting(true);
    const isWhole = parsed.food.name.endsWith('(whole)');
    const multiplier = isWhole ? parsed.weightGrams : (parsed.weightGrams / 100);
    const cal = calculateCalories(parsed.weightGrams, parsed.food.calories_per_100g, isWhole);
    await addFoodLog(user.id, {
      foodName: parsed.food.name,
      weightGrams: parsed.weightGrams,
      calories: cal,
      protein: Math.round(multiplier * parsed.food.protein * 10) / 10,
      carbs: Math.round(multiplier * parsed.food.carbs * 10) / 10,
      fat: Math.round(multiplier * parsed.food.fat * 10) / 10,
    });
    showAddedMessage(parsed.food.name.replace(' (whole)', ''), cal);
    setQuickInput('');
    setIsSubmitting(false);
    refresh();
  };

  const handleManualAdd = async () => {
    if (!manualFood || !manualWeight || !user) return;
    const weight = parseFloat(manualWeight);
    
    // Check if we are creating a custom food
    const cals = parseFloat(manualCalories);
    const prot = parseFloat(manualProtein) || 0;
    const carb = parseFloat(manualCarbs) || 0;
    const f = parseFloat(manualFat) || 0;
    
    let foodToLog;
    setIsSubmitting(true);
    if (!isNaN(cals)) {
      // User entered custom macros per 100g
      const newCustomFood = {
        name: manualFood.trim(),
        calories_per_100g: cals,
        protein: prot,
        carbs: carb,
        fat: f,
        category: 'custom'
      };
      await addCustomFood(user.id, newCustomFood);
      foodToLog = newCustomFood;
    } else {
      // Try to parse from existing DB
      const parsed = parseFoodInput(manualFood, await getCustomFoods(user.id));
      if (!parsed) {
        setIsSubmitting(false);
        return;
      }
      foodToLog = parsed.food;
    }

    const isWhole = foodToLog.name.endsWith('(whole)');
    const multiplier = isWhole ? weight : (weight / 100);
    const cal = calculateCalories(weight, foodToLog.calories_per_100g, isWhole);
    await addFoodLog(user.id, {
      foodName: foodToLog.name,
      weightGrams: weight,
      calories: cal,
      protein: Math.round(multiplier * foodToLog.protein * 10) / 10,
      carbs: Math.round(multiplier * foodToLog.carbs * 10) / 10,
      fat: Math.round(multiplier * foodToLog.fat * 10) / 10,
    });
    showAddedMessage(foodToLog.name.replace(' (whole)', ''), cal);
    setManualFood('');
    setManualWeight('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setIsSubmitting(false);
    refresh();
  };

  const handleBrowseAdd = async () => {
    if (!selectedFood || !browseWeight || !user) return;
    setIsSubmitting(true);
    const weight = parseFloat(browseWeight);
    const isWhole = selectedFood.name.endsWith('(whole)');
    const multiplier = isWhole ? weight : (weight / 100);
    const cal = calculateCalories(weight, selectedFood.calories_per_100g, isWhole);
    await addFoodLog(user.id, {
      foodName: selectedFood.name,
      weightGrams: weight,
      calories: cal,
      protein: Math.round(multiplier * selectedFood.protein * 10) / 10,
      carbs: Math.round(multiplier * selectedFood.carbs * 10) / 10,
      fat: Math.round(multiplier * selectedFood.fat * 10) / 10,
    });
    showAddedMessage(selectedFood.name.replace(' (whole)', ''), cal);
    setSelectedFood(null);
    setBrowseWeight('100');
    setIsSubmitting(false);
    refresh();
  };

  return (
    <AuthGuard>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">ADD FOOD</h1>

      {/* Success message */}
      {addedMessage && (
        <div className="bg-green-400 border-4 border-black p-4 font-bold text-lg shadow-[6px_6px_0px_black]">
          {addedMessage}
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-2">
        {(['quick', 'manual', 'browse'] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode(m)}
            id={`tab-${m}`}
          >
            {m === 'quick' ? 'QUICK' : m === 'manual' ? 'MANUAL' : 'BROWSE'}
          </Button>
        ))}
      </div>

      {/* Quick Mode */}
      {mode === 'quick' && (
        <Card>
          <h2 className="text-xl font-bold mb-4">NATURAL LANGUAGE INPUT</h2>
          <p className="text-sm opacity-60 mb-4">
            Type naturally: &quot;2 eggs&quot;, &quot;200g rice&quot;, &quot;1 plate biryani&quot;, &quot;1 roti&quot;
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder='Type "2 eggs" or "200g rice"...'
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                id="quick-food-input"
              />
            </div>
            <Button onClick={handleQuickAdd} disabled={!quickInput || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
          {quickInput && (
            <div className="mt-4 p-3 bg-[#F7F7F7] border-3 border-black opacity-60">
              <span className="font-bold">Parsing text input... (Supabase Async update in progress)</span>
            </div>
          )}
        </Card>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <Card>
          <h2 className="text-xl font-bold mb-4">MANUAL ENTRY</h2>
          <p className="text-sm opacity-60 mb-4">
            Search for an existing food, or enter macros per 100g to save a custom food to your database.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Food Name"
              value={manualFood}
              onChange={(e) => setManualFood(e.target.value)}
              placeholder="e.g. rice, dal, paneer..."
              id="manual-food-name"
            />
            <Input
              label="Weight (grams)"
              type="number"
              value={manualWeight}
              onChange={(e) => setManualWeight(e.target.value)}
              placeholder="e.g. 200"
              id="manual-food-weight"
            />
          </div>
          
          <div className="mt-6 border-t-3 border-black pt-4">
            <h3 className="font-bold uppercase tracking-wide mb-3 text-sm">Save as Custom Food (Optional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Kcal / 100g"
                type="number"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="e.g. 250"
              />
              <Input
                label="Protein (g)"
                type="number"
                value={manualProtein}
                onChange={(e) => setManualProtein(e.target.value)}
                placeholder="e.g. 15"
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={manualCarbs}
                onChange={(e) => setManualCarbs(e.target.value)}
                placeholder="e.g. 30"
              />
              <Input
                label="Fat (g)"
                type="number"
                value={manualFat}
                onChange={(e) => setManualFat(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <Button className="mt-4" onClick={handleManualAdd} disabled={!manualFood || !manualWeight || isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Food'}
          </Button>
        </Card>
      )}

      {/* Browse Mode */}
      {mode === 'browse' && (
        <div className="space-y-6">
          <Card>
            <Input
              label="Search Foods"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a food..."
              id="browse-search"
            />
          </Card>

          {/* Selected food detail */}
          {selectedFood && (
            <Card color="#FFD600">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold capitalize">{selectedFood.name.replace(' (whole)', '')}</h3>
                  <p className="text-sm opacity-70">{selectedFood.category}</p>
                  <div className="flex gap-3 mt-2 text-sm font-mono">
                    <span>P: {selectedFood.protein}g</span>
                    <span>C: {selectedFood.carbs}g</span>
                    <span>F: {selectedFood.fat}g</span>
                    <span className="font-bold">{selectedFood.calories_per_100g} kcal/{selectedFood.name.endsWith('(whole)') ? 'piece' : '100g'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={browseWeight}
                    onChange={(e) => setBrowseWeight(e.target.value)}
                    className="w-24"
                    id="browse-weight"
                  />
                  <span className="font-bold">{selectedFood.name.endsWith('(whole)') ? 'pieces' : 'g'}</span>
                  <Button onClick={handleBrowseAdd} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>
              {browseWeight && (
                <p className="mt-2 font-mono font-bold text-2xl">
                  = {calculateCalories(parseFloat(browseWeight), selectedFood.calories_per_100g, selectedFood.name.endsWith('(whole)'))} kcal
                </p>
              )}
            </Card>
          )}

          {/* Search results or browse by category */}
          {searchQuery ? (
            <Card>
              <h3 className="font-bold mb-3">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {searchResults.map((food, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFood(food)}
                    className={`text-left p-3 border-3 border-black hover:bg-[#FFD600] transition-colors cursor-pointer ${
                      selectedFood?.name === food.name ? 'bg-[#FFD600]' : 'bg-white'
                    }`}
                  >
                    <span className="font-bold capitalize">{food.name.replace(' (whole)', '')}</span>
                    <span className="ml-2 text-sm opacity-60 font-mono">{food.calories_per_100g} kcal/{food.name.endsWith('(whole)') ? 'piece' : '100g'}</span>
                  </button>
                ))}
                {searchResults.length === 0 && (
                  <p className="opacity-50 col-span-2">No foods found for &quot;{searchQuery}&quot;</p>
                )}
              </div>
            </Card>
          ) : (
            categories.map((cat) => (
              <Card key={cat}>
                <h3 className="font-bold mb-3 uppercase tracking-wide text-sm">{cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allFoods
                    .filter((f) => f.category === cat)
                    .map((food, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedFood(food)}
                        className={`text-left p-3 border-3 border-black hover:bg-[#FFD600] transition-colors cursor-pointer ${
                          selectedFood?.name === food.name ? 'bg-[#FFD600]' : 'bg-white'
                        }`}
                      >
                        <span className="font-bold capitalize">{food.name.replace(' (whole)', '')}</span>
                        <span className="ml-2 text-sm opacity-60 font-mono">{food.calories_per_100g} kcal/{food.name.endsWith('(whole)') ? 'piece' : '100g'}</span>
                      </button>
                    ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
