import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_KEY = 'nutriminar_goals';

export type NutritionGoals = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  magnesium: number;
  iron: number;
};

export const defaultGoals: NutritionGoals = {
  kcal: 2000,
  protein: 90,
  fat: 70,
  carbs: 250,
  magnesium: 375,
  iron: 14,
};

export async function getGoals(): Promise<NutritionGoals> {
  const raw = await AsyncStorage.getItem(GOALS_KEY);
  return raw ? JSON.parse(raw) : defaultGoals;
}

export async function saveGoals(goals: NutritionGoals) {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}