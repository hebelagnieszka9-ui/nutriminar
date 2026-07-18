import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { defaultGoals, getGoals, NutritionGoals } from '../../services/goals';
import { getMeals, SavedMeal } from '../../services/meals';

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function percent(value: number, goal: number) {
  if (!goal) return 0;
  return Math.min(999, round((value / goal) * 100));
}

export default function HomeScreen() {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>(defaultGoals);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const [mealsData, goalsData] = await Promise.all([getMeals(), getGoals()]);
        setMeals(mealsData);
        setGoals(goalsData);
      }

      loadData();
    }, [])
  );

  const todayMeals = useMemo(() => {
    const today = new Date().toDateString();

    return meals.filter((meal) => {
      if (!meal.createdAt) return false;
      return new Date(meal.createdAt).toDateString() === today;
    });
  }, [meals]);

  const summary = useMemo(() => {
    return todayMeals.reduce(
      (acc, meal) => {
        const totals = meal.totals ?? {
          kcal: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          magnesium: 0,
          iron: 0,
        };

        return {
          kcal: round(acc.kcal + (totals.kcal || 0)),
          protein: round(acc.protein + (totals.protein || 0)),
          fat: round(acc.fat + (totals.fat || 0)),
          carbs: round(acc.carbs + (totals.carbs || 0)),
          magnesium: round(acc.magnesium + (totals.magnesium || 0)),
          iron: round(acc.iron + (totals.iron || 0)),
        };
      },
      {
        kcal: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        magnesium: 0,
        iron: 0,
      }
    );
  }, [todayMeals]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>NutriMiner</Text>
      <Text style={styles.subtitle}>
        Dzisiejsze podsumowanie Twojego odżywiania
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Zapisane posiłki dzisiaj</Text>
        <Text style={styles.heroValue}>{todayMeals.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Podsumowanie dnia</Text>

      <View style={styles.grid}>
        <StatCard label="Kalorie" value={summary.kcal} unit="kcal" progress={`${percent(summary.kcal, goals.kcal)}% celu`} />
        <StatCard label="Białko" value={summary.protein} unit="g" progress={`${percent(summary.protein, goals.protein)}% celu`} />
        <StatCard label="Tłuszcz" value={summary.fat} unit="g" progress={`${percent(summary.fat, goals.fat)}% celu`} />
        <StatCard label="Węglowodany" value={summary.carbs} unit="g" progress={`${percent(summary.carbs, goals.carbs)}% celu`} />
        <StatCard label="Magnez" value={summary.magnesium} unit="mg" progress={`${percent(summary.magnesium, goals.magnesium)}% celu`} />
        <StatCard label="Żelazo" value={summary.iron} unit="mg" progress={`${percent(summary.iron, goals.iron)}% celu`} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Orientacyjne dzienne zapotrzebowanie dorosłych</Text>
        <Text style={styles.infoText}>Magnez: około 375 mg / dzień</Text>
        <Text style={styles.infoText}>Żelazo: około 14 mg / dzień</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Dobra robota 🌿</Text>
        <Text style={styles.infoText}>
          Każdy zapisany posiłek pomaga lepiej kontrolować kalorie, makroskładniki
          i ważne minerały.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  unit,
  progress,
}: {
  label: string;
  value: number;
  unit: string;
  progress: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statProgress}>{progress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  heroLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 8,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statUnit: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statProgress: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 8,
    fontWeight: '600',
  },
  infoCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
});