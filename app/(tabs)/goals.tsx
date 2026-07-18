import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { defaultGoals, getGoals, saveGoals } from '../../services/goals';

export default function GoalsScreen() {
  const [form, setForm] = useState({
    kcal: String(defaultGoals.kcal),
    protein: String(defaultGoals.protein),
    fat: String(defaultGoals.fat),
    carbs: String(defaultGoals.carbs),
    magnesium: String(defaultGoals.magnesium),
    iron: String(defaultGoals.iron),
  });

  useEffect(() => {
    async function loadGoals() {
      const goals = await getGoals();
      setForm({
        kcal: String(goals.kcal),
        protein: String(goals.protein),
        fat: String(goals.fat),
        carbs: String(goals.carbs),
        magnesium: String(goals.magnesium),
        iron: String(goals.iron),
      });
    }

    loadGoals();
  }, []);

  async function handleSave() {
    await saveGoals({
      kcal: Number(form.kcal || 0),
      protein: Number(form.protein || 0),
      fat: Number(form.fat || 0),
      carbs: Number(form.carbs || 0),
      magnesium: Number(form.magnesium || 0),
      iron: Number(form.iron || 0),
    });

    Alert.alert('Sukces', 'Cele zostały zapisane.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cele żywieniowe</Text>
      <Text style={styles.subtitle}>
        Ustaw swoje dzienne cele kalorii, makroskładników i minerałów.
      </Text>

      <GoalField label="Kalorie (kcal)" value={form.kcal} onChangeText={(v) => setForm((p) => ({ ...p, kcal: v }))} />
      <GoalField label="Białko (g)" value={form.protein} onChangeText={(v) => setForm((p) => ({ ...p, protein: v }))} />
      <GoalField label="Tłuszcz (g)" value={form.fat} onChangeText={(v) => setForm((p) => ({ ...p, fat: v }))} />
      <GoalField label="Węglowodany (g)" value={form.carbs} onChangeText={(v) => setForm((p) => ({ ...p, carbs: v }))} />
      <GoalField label="Magnez (mg)" value={form.magnesium} onChangeText={(v) => setForm((p) => ({ ...p, magnesium: v }))} />
      <GoalField label="Żelazo (mg)" value={form.iron} onChangeText={(v) => setForm((p) => ({ ...p, iron: v }))} />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Orientacyjne dzienne zapotrzebowanie dorosłych</Text>
        <Text style={styles.infoText}>Magnez: około 375 mg / dzień</Text>
        <Text style={styles.infoText}>Żelazo: około 14 mg / dzień</Text>
      </View>

      <Pressable onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Zapisz cele</Text>
      </Pressable>
    </ScrollView>
  );
}

function GoalField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  field: {
    gap: 6,
  },
  label: {
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  infoTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  infoText: {
    color: '#475569',
  },
  saveButton: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});