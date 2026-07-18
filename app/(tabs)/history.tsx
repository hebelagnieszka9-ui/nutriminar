import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMeals } from '../../services/meals';

export default function HistoryScreen() {
  const [meals, setMeals] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadMeals() {
        const data = await getMeals();
        setMeals(data);
      }

      loadMeals();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historia posiłków</Text>

      {meals.length === 0 ? (
        <Text style={styles.empty}>Brak zapisanych posiłków.</Text>
      ) : (
        meals.map((meal) => {
          const isNewFormat = Array.isArray(meal.items);

          return (
            <View key={meal.id} style={styles.card}>
              <Text style={styles.name}>
                {meal.mealName || meal.productName || 'Posiłek'}
              </Text>

              <Text style={styles.date}>
                {meal.createdAt ? new Date(meal.createdAt).toLocaleString() : ''}
              </Text>

              {isNewFormat ? (
                <>
                  {meal.items.map((item: any) => (
                    <View key={item.id} style={styles.itemBlock}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.text}>Waga: {item.weight} g</Text>
                      <Text style={styles.text}>Kalorie: {item.values.kcal} kcal</Text>
                      <Text style={styles.text}>Białko: {item.values.protein} g</Text>
                      <Text style={styles.text}>Tłuszcz: {item.values.fat} g</Text>
                      <Text style={styles.text}>Węglowodany: {item.values.carbs} g</Text>
                      <Text style={styles.text}>Magnez: {item.values.magnesium} mg</Text>
                      <Text style={styles.text}>Żelazo: {item.values.iron} mg</Text>
                    </View>
                  ))}

                  <View style={styles.totalBlock}>
                    <Text style={styles.totalTitle}>Suma posiłku</Text>
                    <Text style={styles.text}>Kalorie: {meal.totals?.kcal ?? 0} kcal</Text>
                    <Text style={styles.text}>Białko: {meal.totals?.protein ?? 0} g</Text>
                    <Text style={styles.text}>Tłuszcz: {meal.totals?.fat ?? 0} g</Text>
                    <Text style={styles.text}>Węglowodany: {meal.totals?.carbs ?? 0} g</Text>
                    <Text style={styles.text}>Magnez: {meal.totals?.magnesium ?? 0} mg</Text>
                    <Text style={styles.text}>Żelazo: {meal.totals?.iron ?? 0} mg</Text>
                  </View>
                </>
              ) : (
                <View style={styles.itemBlock}>
                  <Text style={styles.itemName}>{meal.productName}</Text>
                  <Text style={styles.text}>Waga: {meal.weight} g</Text>
                  <Text style={styles.text}>Kalorie: {meal.values?.kcal ?? 0} kcal</Text>
                  <Text style={styles.text}>Białko: {meal.values?.protein ?? 0} g</Text>
                  <Text style={styles.text}>Tłuszcz: {meal.values?.fat ?? 0} g</Text>
                  <Text style={styles.text}>Węglowodany: {meal.values?.carbs ?? 0} g</Text>
                  <Text style={styles.text}>Magnez: {meal.values?.magnesium ?? 0} mg</Text>
                  <Text style={styles.text}>Żelazo: {meal.values?.iron ?? 0} mg</Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    gap: 12,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  empty: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
  },
  itemBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  totalBlock: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    gap: 2,
  },
  totalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#334155',
  },
});