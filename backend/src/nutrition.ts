export type Nutrition = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  magnesium: number;
  iron: number;
};

export function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function scaleNutrition(per100g: Nutrition, grams: number): Nutrition {
  const ratio = grams / 100;

  return {
    kcal: round(per100g.kcal * ratio),
    protein: round(per100g.protein * ratio),
    fat: round(per100g.fat * ratio),
    carbs: round(per100g.carbs * ratio),
    magnesium: round(per100g.magnesium * ratio),
    iron: round(per100g.iron * ratio),
  };
}

export function sumNutrition(values: Nutrition[]): Nutrition {
  return values.reduce(
    (acc, item) => ({
      kcal: round(acc.kcal + item.kcal),
      protein: round(acc.protein + item.protein),
      fat: round(acc.fat + item.fat),
      carbs: round(acc.carbs + item.carbs),
      magnesium: round(acc.magnesium + item.magnesium),
      iron: round(acc.iron + item.iron),
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0, magnesium: 0, iron: 0 }
  );
}