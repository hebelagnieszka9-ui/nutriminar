import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { activatePremium, deactivatePremium, isPremium } from '../../services/premium';

type AnalysisResult = {
  detectedMeal?: string;
  confidence?: number;
  ingredients?: Array<{
    name: string;
    estimatedWeight: number;
    matched?: boolean;
    nutrition?: {
      kcal: number;
      protein: number;
      fat: number;
      carbs: number;
      magnesium: number;
      iron: number;
    } | null;
  }>;
  totals?: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
    magnesium: number;
    iron: number;
  };
  note?: string;
};

export default function PremiumScreen() {
  const [active, setActive] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const status = await isPremium();
        setActive(status);
      }
      load();
    }, [])
  );

  async function handleToggle() {
    if (active) {
      await deactivatePremium();
      setActive(false);
      Alert.alert('Premium wyłączone');
    } else {
      await activatePremium();
      setActive(true);
      Alert.alert('Premium aktywne 🎉');
    }
  }

  async function analyzeBase64Image(base64Image: string, uri: string) {
    try {
      setLoading(true);
      setImageUri(uri);
      setAnalysis(null);

      const response = await fetch('http://YOUR_BACKEND_URL/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_SHARED_SECRET',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Nie udało się przeanalizować zdjęcia.');
      }

      setAnalysis(data);
    } catch (error: any) {
      Alert.alert('Błąd analizy', error?.message || 'Wystąpił problem.');
    } finally {
      setLoading(false);
    }
  }

  async function openGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Brak dostępu', 'Zezwól aplikacji na dostęp do galerii.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert('Błąd', 'Nie udało się odczytać zdjęcia z galerii.');
      return;
    }

    await analyzeBase64Image(asset.base64, asset.uri);
  }

  async function openCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Brak dostępu', 'Zezwól aplikacji na dostęp do aparatu.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert('Błąd', 'Nie udało się odczytać zrobionego zdjęcia.');
      return;
    }

    await analyzeBase64Image(asset.base64, asset.uri);
  }

  function handlePickImage() {
    if (!active) {
      Alert.alert('Funkcja premium', 'Aktywuj Premium, aby korzystać z analizy zdjęć.');
      return;
    }

    Alert.alert('Analiza zdjęcia', 'Wybierz źródło zdjęcia', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Zrób zdjęcie', onPress: () => void openCamera() },
      { text: 'Wybierz z galerii', onPress: () => void openGallery() },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Premium</Text>
      <Text style={styles.subtitle}>
        Odblokuj zaawansowane funkcje i analizę diety
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>
          {active ? 'Masz Premium' : 'Odblokuj Premium'}
        </Text>
        <Text style={styles.heroText}>
          {active
            ? 'Korzystasz z pełnej wersji aplikacji.'
            : 'Zyskaj dostęp do inteligentnych funkcji i analizy zdjęć.'}
        </Text>

        <Pressable onPress={handleToggle} style={styles.heroButton}>
          <Text style={styles.heroButtonText}>
            {active ? 'Wyłącz Premium' : 'Aktywuj Premium'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Analiza zdjęcia posiłku</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Zeskanuj posiłek</Text>
        <Text style={styles.cardText}>
          Zrób zdjęcie na bieżąco albo wybierz je z galerii. Aplikacja spróbuje
          rozpoznać składniki i oszacować wartości odżywcze.
        </Text>

        <Pressable onPress={handlePickImage} style={styles.scanButton}>
          <Text style={styles.scanButtonText}>
            {loading ? 'Analizowanie...' : 'Wybierz zdjęcie'}
          </Text>
        </Pressable>

        {!active && (
          <Text style={styles.lockInfo}>🔒 Ta funkcja wymaga wersji Premium</Text>
        )}
      </View>

      {imageUri ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wybrane zdjęcie</Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      ) : null}

      {analysis ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wynik analizy</Text>

          <Text style={styles.resultTitle}>
            {analysis.detectedMeal || 'Rozpoznany posiłek'}
          </Text>
          <Text style={styles.cardText}>
            Pewność rozpoznania: {analysis.confidence ?? 0}
          </Text>

          {analysis.ingredients?.length ? (
            <View style={styles.resultBlock}>
              <Text style={styles.resultSubtitle}>Składniki</Text>
              {analysis.ingredients.map((item, index) => (
                <View key={`${item.name}-${index}`} style={styles.ingredientRow}>
                  <Text style={styles.ingredientName}>
                    {item.name} · {item.estimatedWeight} g
                  </Text>
                  {item.nutrition ? (
                    <Text style={styles.ingredientText}>
                      {item.nutrition.kcal} kcal · B {item.nutrition.protein} g · T{' '}
                      {item.nutrition.fat} g · W {item.nutrition.carbs} g
                    </Text>
                  ) : (
                    <Text style={styles.ingredientText}>
                      Brak dopasowania do bazy
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : null}

          {analysis.totals ? (
            <View style={styles.resultBlock}>
              <Text style={styles.resultSubtitle}>Suma</Text>
              <Text style={styles.ingredientText}>Kalorie: {analysis.totals.kcal} kcal</Text>
              <Text style={styles.ingredientText}>Białko: {analysis.totals.protein} g</Text>
              <Text style={styles.ingredientText}>Tłuszcz: {analysis.totals.fat} g</Text>
              <Text style={styles.ingredientText}>Węglowodany: {analysis.totals.carbs} g</Text>
              <Text style={styles.ingredientText}>Magnez: {analysis.totals.magnesium} mg</Text>
              <Text style={styles.ingredientText}>Żelazo: {analysis.totals.iron} mg</Text>
            </View>
          ) : null}

          {analysis.note ? <Text style={styles.note}>{analysis.note}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroText: {
    color: '#CBD5E1',
  },
  heroButton: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroButtonText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  cardText: {
    color: '#475569',
  },
  scanButton: {
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lockInfo: {
    textAlign: 'center',
    color: '#64748B',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultBlock: {
    gap: 6,
  },
  resultSubtitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  ingredientRow: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  ingredientName: {
    fontWeight: '700',
    color: '#0F172A',
  },
  ingredientText: {
    color: '#475569',
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    color: '#64748B',
  },
});