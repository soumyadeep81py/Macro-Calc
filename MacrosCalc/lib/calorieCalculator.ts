export function calculateCalories(weightOrCount: number, caloriesRef: number, isWhole: boolean = false): number {
  if (isWhole) return Math.round(weightOrCount * caloriesRef);
  return Math.round((weightOrCount / 100) * caloriesRef);
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/**
 * Calculate BMR using the Mifflin-St Jeor equation
 * @param weightKg - weight in kilograms
 * @param heightCm - height in centimeters
 * @param age - age in years
 * @param gender - 'male' or 'female'
 * @returns BMR in kcal/day
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level
 * @returns Daily calorie needs in kcal
 */
export function calculateDailyCalories(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function getActivityLabel(level: ActivityLevel): string {
  const labels: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Light (exercise 1-3 days/week)',
    moderate: 'Moderate (exercise 3-5 days/week)',
    active: 'Active (exercise 6-7 days/week)',
  };
  return labels[level];
}
