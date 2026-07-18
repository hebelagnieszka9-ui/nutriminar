import AsyncStorage from '@react-native-async-storage/async-storage';

const MEALS_KEY = 'nutriminar_meals';

export type MealItem = {
  id: string;
  productName: string;
  weight: number;
  values: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
    magnesium: number;
    iron: number;
  };
};

export type SavedMeal = {
  id: string;
  mealName: string;
  items: MealItem[];
  totals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
    magnesium: number;
    iron: number;
  };
  createdAt: string;
};

export async function getMeals(): Promise<SavedMeal[]> {
  const raw = await AsyncStorage.getItem(MEALS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMeal(meal: SavedMeal) {
  const meals = await getMeals();
  const nextMeals = [meal, ...meals];
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(nextMeals));
}