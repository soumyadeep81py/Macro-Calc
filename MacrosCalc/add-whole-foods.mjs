import fs from 'fs';

const foods = JSON.parse(fs.readFileSync('data/foods.json', 'utf8'));

const UNIT_WEIGHTS = {
  egg: 50,
  roti: 40,
  paratha: 80,
  naan: 90,
  idli: 60,
  dosa: 120,
  banana: 120,
  apple: 180,
  orange: 150,
  guava: 100,
  samosa: 80,
  pakora: 30,
  puri: 30,
  vada: 50,
  'vada pav': 150,
  'pav bhaji': 250,
  'bhel puri': 150,
  'pani puri': 20,
  'dhokla': 50,
  'kachori': 80,
  'jalebi': 40,
  'gulab jamun': 50,
  'rasgulla': 50,
  'ladoo': 40,
  'barfi': 30,
  'mango': 200,
};

const foodsToConvert = {
  'egg boiled': 'egg',
  'roti': 'roti',
  'paratha': 'paratha',
  'naan': 'naan',
  'puri': 'puri',
  'idli': 'idli',
  'dosa': 'dosa',
  'banana': 'banana',
  'apple': 'apple',
  'orange': 'orange',
  'guava': 'guava',
  'samosa': 'samosa',
  'pakora': 'pakora',
  'vada pav': 'vada pav',
  'pav bhaji': 'pav bhaji',
  'bhel puri': 'bhel puri',
  'pani puri': 'pani puri',
  'dhokla': 'dhokla',
  'kachori': 'kachori',
  'jalebi': 'jalebi',
  'gulab jamun': 'gulab jamun',
  'rasgulla': 'rasgulla',
  'ladoo': 'ladoo',
  'barfi': 'barfi',
  'mango': 'mango',
};

const newFoods = [...foods];
const addedNames = new Set(foods.map(f => f.name));

for (const food of foods) {
  if (foodsToConvert[food.name]) {
    const key = foodsToConvert[food.name];
    const weight = UNIT_WEIGHTS[key];
    if (weight) {
      const factor = weight / 100;
      const wholeName = key + ' (whole)';
      
      if (!addedNames.has(wholeName)) {
        newFoods.push({
          ...food,
          name: wholeName,
          calories_per_100g: Math.round(food.calories_per_100g * factor),
          protein: Math.round(food.protein * factor * 10) / 10,
          carbs: Math.round(food.carbs * factor * 10) / 10,
          fat: Math.round(food.fat * factor * 10) / 10,
        });
        addedNames.add(wholeName);
      }
    }
  }
}

fs.writeFileSync('data/foods.json', JSON.stringify(newFoods, null, 2));
console.log('Added whole variants to foods.json');
