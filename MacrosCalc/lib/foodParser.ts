import foodsData from '@/data/foods.json';
import { type CustomFood } from '@/lib/calorieStore';

export interface FoodItem {
  name: string;
  calories_per_100g: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

export interface ParsedFood {
  food: FoodItem;
  weightGrams: number;
  originalInput: string;
}

// Standard unit-to-gram mappings for common Indian foods
const UNIT_WEIGHTS: Record<string, number> = {
  egg: 50,
  eggs: 50,
  roti: 40,
  rotis: 40,
  chapati: 40,
  chapatis: 40,
  paratha: 80,
  parathas: 80,
  naan: 90,
  naans: 90,
  idli: 60,
  idlis: 60,
  dosa: 120,
  dosas: 120,
  banana: 120,
  bananas: 120,
  apple: 180,
  apples: 180,
  orange: 150,
  oranges: 150,
  guava: 100,
  samosa: 80,
  samosas: 80,
  pakora: 30,
  pakoras: 30,
  puri: 30,
  puris: 30,
  vada: 50,
  vadas: 50,
  "vada pav": 150,
  "vada pavs": 150,
  jalebi: 40,
  jalebis: 40,
  "gulab jamun": 45,
  "gulab jamuns": 45,
  rasgulla: 40,
  rasgullas: 40,
  ladoo: 50,
  ladoos: 50,
  barfi: 40,
  barfis: 40,
  kachori: 70,
  kachoris: 70,
  slice: 30,
  slices: 30,
  cup: 200,
  cups: 200,
  bowl: 250,
  bowls: 250,
  plate: 300,
  plates: 300,
  glass: 200,
  glasses: 200,
  piece: 50,
  pieces: 50,
  spoon: 15,
  spoons: 15,
  tablespoon: 15,
  tablespoons: 15,
  teaspoon: 5,
  teaspoons: 5,
};

/**
 * Parse natural language food input like:
 * "2 eggs", "200g rice", "1 plate biryani", "1 roti"
 */
export function parseFoodInput(input: string, customFoods: CustomFood[] = []): ParsedFood | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // Pattern 1: "200g rice" or "200 g rice"
  const gramMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*g(?:rams?)?\s+(.+)$/i);
  if (gramMatch) {
    const weight = parseFloat(gramMatch[1]);
    const foodName = gramMatch[2].trim();
    const food = findFood(foodName, customFoods);
    if (food) {
      return { food, weightGrams: weight, originalInput: input };
    }
  }

  // Pattern 2: "2 eggs" or "1 roti" or "1 plate biryani"
  const quantityMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (quantityMatch) {
    const quantity = parseFloat(quantityMatch[1]);
    const rest = quantityMatch[2].trim();

    // Check for whole version first
    const singularRest = rest.endsWith('s') ? rest.slice(0, -1) : rest;
    const wholeFood = findFood(singularRest + ' (whole)', customFoods) || findFood(rest + ' (whole)', customFoods);
    
    if (wholeFood) {
      return {
        food: wholeFood,
        weightGrams: quantity, // we reuse weightGrams for count since it's a generic amount field
        originalInput: input,
      };
    }

    // Check if the rest starts with a unit word ("plate biryani", "bowl dal")
    const words = rest.split(/\s+/);
    if (words.length >= 2 && UNIT_WEIGHTS[words[0]]) {
      const unitWeight = UNIT_WEIGHTS[words[0]];
      const foodName = words.slice(1).join(' ');
      const food = findFood(foodName, customFoods);
      if (food) {
        return {
          food,
          weightGrams: Math.round(quantity * unitWeight),
          originalInput: input,
        };
      }
    }

    // Check if the whole rest is a food with known unit weight
    // e.g. "2 eggs" \u2192 eggs has unit weight 50g
    const food = findFood(rest, customFoods);
    if (food) {
      const unitWeight = UNIT_WEIGHTS[rest] || UNIT_WEIGHTS[words[0]] || 100;
      return {
        food,
        weightGrams: Math.round(quantity * unitWeight),
        originalInput: input,
      };
    }
  }

  // Pattern 3: just a food name like "rice" (assume 100g)
  const food = findFood(trimmed, customFoods);
  if (food) {
    return { food, weightGrams: 100, originalInput: input };
  }

  return null;
}

/**
 * Fuzzy find a food item by name in the database
 */
export function findFood(query: string, customFoods: CustomFood[] = []): FoodItem | null {
  const q = query.toLowerCase().trim();
  const foods = [...customFoods, ...(foodsData as FoodItem[])];

  // Exact match
  const exact = foods.find((f) => f.name === q);
  if (exact) return exact;

  // Starts with
  const startsWith = foods.find((f) => f.name.startsWith(q));
  if (startsWith) return startsWith;

  // Contains
  const contains = foods.find((f) => f.name.includes(q));
  if (contains) return contains;

  // Reverse contains (query contains food name)
  const reverseContains = foods.find((f) => q.includes(f.name));
  if (reverseContains) return reverseContains;

  return null;
}

/**
 * Search foods by partial name for autocomplete
 */
export function searchFoods(query: string, limit: number = 8, customFoods: CustomFood[] = []): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const foods = [...customFoods, ...(foodsData as FoodItem[])];
  const results: FoodItem[] = [];

  // Prioritize: exact → starts with → contains
  for (const food of foods) {
    if (food.name === q) {
      results.unshift(food);
    } else if (food.name.startsWith(q)) {
      results.push(food);
    }
  }

  for (const food of foods) {
    if (food.name.includes(q) && !results.includes(food)) {
      results.push(food);
    }
  }

  return results.slice(0, limit);
}

export function getAllFoods(customFoods: CustomFood[] = []): FoodItem[] {
  return [...customFoods, ...(foodsData as FoodItem[])];
}
