'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { parseFoodInput, searchFoods, type FoodItem, type ParsedFood } from '@/lib/foodParser';
import { calculateCalories } from '@/lib/calorieCalculator';
import { addFoodLog, useCalorieContext, getCustomFoods, type CustomFood } from '@/lib/calorieStore';
import { useAuth } from '@/components/AuthProvider';

export default function FoodForm() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedFood | null>(null);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { refresh, refreshKey } = useCalorieContext();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getCustomFoods(user.id).then(setCustomFoods);
    }
  }, [user, refreshKey]);

  useEffect(() => {
    if (input.length > 0) {
      const result = parseFoodInput(input, customFoods);
      setParsed(result);

      // Get search suggestions from raw food name
      const words = input.trim().split(/\s+/);
      const searchTerm = words.length > 1 && /^\d/.test(words[0])
        ? words.slice(1).join(' ')
        : input;
      const results = searchFoods(searchTerm, 8, customFoods);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 && !result);
    } else {
      setParsed(null);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleAdd = async () => {
    if (!parsed || !user) return;
    setIsSubmitting(true);
    
    const isWhole = parsed.food.name.endsWith('(whole)');
    const multiplier = isWhole ? parsed.weightGrams : (parsed.weightGrams / 100);
    const calories = calculateCalories(parsed.weightGrams, parsed.food.calories_per_100g, isWhole);
    const protein = Math.round(multiplier * parsed.food.protein * 10) / 10;
    const carbs = Math.round(multiplier * parsed.food.carbs * 10) / 10;
    const fat = Math.round(multiplier * parsed.food.fat * 10) / 10;

    await addFoodLog(user.id, {
      foodName: parsed.food.name,
      weightGrams: parsed.weightGrams,
      calories,
      protein,
      carbs,
      fat,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 800);

    setInput('');
    setParsed(null);
    setIsSubmitting(false);
    refresh();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (food: FoodItem) => {
    setInput(food.name);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsed) {
      handleAdd();
    }
  };

  const isWhole = parsed ? parsed.food.name.endsWith('(whole)') : false;
  const calculatedCalories = parsed
    ? calculateCalories(parsed.weightGrams, parsed.food.calories_per_100g, isWhole)
    : 0;
  const multiplier = parsed ? (isWhole ? parsed.weightGrams : parsed.weightGrams / 100) : 0;

  return (
    <Card className="relative">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">QUICK ADD</h2>

      <div className="relative">
        <Input
          ref={inputRef}
          placeholder='Try "2 eggs" or "200g rice" or "1 plate biryani"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && !parsed && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          id="food-input"
        />

        {/* Autocomplete dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border-4 border-black shadow-[6px_6px_0px_black] max-h-48 overflow-y-auto">
            {suggestions.map((food, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-2.5 hover:bg-[#FFD600] transition-colors border-b-2 border-black/10 last:border-0 cursor-pointer"
                onClick={() => handleSuggestionClick(food)}
              >
                <span className="font-bold capitalize">{food.name.replace(' (whole)', '')}</span>
                <span className="text-sm ml-2 opacity-60">
                  {food.calories_per_100g} kcal/{food.name.endsWith('(whole)') ? 'piece' : '100g'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Parsed preview */}
      {parsed && (
        <div className="mt-4 p-4 bg-[#F7F7F7] border-3 border-black">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold capitalize text-lg">{parsed.food.name.replace(' (whole)', '')}</span>
              <span className="ml-2 text-sm opacity-70">{parsed.weightGrams}{isWhole ? ' whole' : 'g'}</span>
            </div>
            <div className="font-mono text-2xl font-bold text-[#FF4D00]">
              {calculatedCalories} kcal
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-sm font-mono">
            <span>P: {Math.round(multiplier * parsed.food.protein * 10) / 10}g</span>
            <span>C: {Math.round(multiplier * parsed.food.carbs * 10) / 10}g</span>
            <span>F: {Math.round(multiplier * parsed.food.fat * 10) / 10}g</span>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button
          onClick={handleAdd}
          disabled={!parsed || isSubmitting}
          className={`w-full ${!parsed ? 'opacity-50 cursor-not-allowed' : ''} ${addedAnimation ? 'bg-green-400' : ''}`}
        >
          {addedAnimation ? '✓ Added!' : isSubmitting ? 'Adding...' : '+ Add Food'}
        </Button>
      </div>
    </Card>
  );
}
