import React, { useMemo, useRef, useState } from 'react';
import {
    Alert,
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { categories, products } from '../../data/products';
import { MealItem, saveMeal } from '../../services/meals';

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export default function AddMealScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [mealSectionY, setMealSectionY] = useState(0);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [weight, setWeight] = useState('100');
  const [mealName, setMealName] = useState('Mój posiłek');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Wszystkie' || product.category === selectedCategory;

      if (query.trim().length > 0) {
        return matchesQuery && matchesCategory;
      }

      if (selectedCategory !== 'Wszystkie') {
        return matchesCategory;
      }

      return false;
    });
  }, [query, selectedCategory]);

  const shouldShowProducts =
    query.trim().length > 0 || selectedCategory !== 'Wszystkie';

  const grams = Number(weight || 0);
  const ratio = grams / 100;

  const currentResult = {
    kcal: round(selectedProduct.kcal * ratio),
    protein: round(selectedProduct.protein * ratio),
    fat: round(selectedProduct.fat * ratio),
    carbs: round(selectedProduct.carbs * ratio),
    magnesium: round(selectedProduct.magnesium * ratio),
    iron: round(selectedProduct.iron * ratio),
  };

  const totals = mealItems.reduce(
    (acc, item) => ({
      kcal: round(acc.kcal + item.values.kcal),
      protein: round(acc.protein + item.values.protein),
      fat: round(acc.fat + item.values.fat),
      carbs: round(acc.carbs + item.values.carbs),
      magnesium: round(acc.magnesium + item.values.magnesium),
      iron: round(acc.iron + item.values.iron),
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0, magnesium: 0, iron: 0 }
  );

  function handleSelectProduct(product: (typeof products)[number]) {
    setSelectedProduct(product);
    setQuery('');
    setSelectedCategory('Wszystkie');
  }

  function handleMealSectionLayout(event: LayoutChangeEvent) {
    setMealSectionY(event.nativeEvent.layout.y);
  }

  function scrollToMealSection() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(mealSectionY - 20, 0),
        animated: true,
      });
    });
  }

  function handleAddToMeal() {
    if (!grams || grams <= 0) {
      Alert.alert('Błąd', 'Podaj poprawną wagę produktu.');
      return;
    }

    const item: MealItem = {
      id: String(Date.now() + Math.random()),
      productName: selectedProduct.name,
      weight: grams,
      values: currentResult,
    };

    setMealItems((prev) => [item, ...prev]);
    setWeight('100');
    setQuery('');
    setSelectedCategory('Wszystkie');

    setTimeout(() => {
      scrollToMealSection();
    }, 150);
  }

  function handleRemoveItem(id: string) {
    setMealItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSaveMeal() {
    if (mealItems.length === 0) {
      Alert.alert('Błąd', 'Dodaj przynajmniej jeden produkt.');
      return;
    }

    await saveMeal({
      id: String(Date.now()),
      mealName,
      items: mealItems,
      totals,
      createdAt: new Date().toISOString(),
    });

    setMealItems([]);
    setMealName('Mój posiłek');
    setQuery('');
    setSelectedCategory('Wszystkie');

    Alert.alert('Sukces', 'Posiłek zapisany.');
  }

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dodaj posiłek</Text>

      <Text style={styles.sectionTitle}>Nazwa posiłku</Text>
      <TextInput
        value={mealName}
        onChangeText={setMealName}
        style={styles.input}
        placeholder="Np. Śniadanie"
      />

      <Text style={styles.sectionTitle}>Kategoria</Text>
      <View style={styles.quickRow}>
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.quickButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
          >
            <Text
              style={[
                styles.quickButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Wyszukaj produkt</Text>
      <TextInput
        placeholder="Zacznij wpisywać nazwę produktu..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {!shouldShowProducts ? (
        <Text style={styles.helperText}>
          Wybierz kategorię lub zacznij wpisywać nazwę produktu, aby zobaczyć listę.
        </Text>
      ) : (
        <View style={styles.list}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isActive = selectedProduct.name === product.name;

              return (
                <Pressable
                  key={product.name}
                  onPress={() => handleSelectProduct(product)}
                  style={[
                    styles.productButton,
                    isActive && styles.productButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.productName,
                      isActive && styles.productNameActive,
                    ]}
                  >
                    {product.name}
                  </Text>
                  <Text
                    style={[
                      styles.productMeta,
                      isActive && styles.productMetaActive,
                    ]}
                  >
                    {product.category} · {product.kcal} kcal / 100 g
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.empty}>Brak produktów pasujących do wyszukiwania.</Text>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Gramatura produktu</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
        placeholder="Waga w gramach"
      />

      <View style={styles.quickRow}>
        {[50, 100, 150, 200].map((g) => (
          <Pressable key={g} onPress={() => setWeight(String(g))} style={styles.gramButton}>
            <Text style={styles.gramButtonText}>{g} g</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Wynik dla produktu</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{selectedProduct.name}</Text>
        <Text style={styles.meta}>{selectedProduct.category}</Text>
        <Text style={styles.text}>Kalorie: {currentResult.kcal} kcal</Text>
        <Text style={styles.text}>Białko: {currentResult.protein} g</Text>
        <Text style={styles.text}>Tłuszcz: {currentResult.fat} g</Text>
        <Text style={styles.text}>Węglowodany: {currentResult.carbs} g</Text>
        <Text style={styles.text}>Magnez: {currentResult.magnesium} mg</Text>
        <Text style={styles.text}>Żelazo: {currentResult.iron} mg</Text>
      </View>

      <Pressable onPress={handleAddToMeal} style={styles.addButton}>
        <Text style={styles.addButtonText}>Dodaj produkt do posiłku</Text>
      </Pressable>

      <View onLayout={handleMealSectionLayout}>
        <Text style={styles.sectionTitle}>Aktualny posiłek</Text>

        {mealItems.length === 0 ? (
          <Text style={styles.empty}>Nie dodano jeszcze żadnych produktów.</Text>
        ) : (
          mealItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.productName}</Text>
              <Text style={styles.text}>Waga: {item.weight} g</Text>
              <Text style={styles.text}>Kalorie: {item.values.kcal} kcal</Text>
              <Text style={styles.text}>Białko: {item.values.protein} g</Text>
              <Text style={styles.text}>Tłuszcz: {item.values.fat} g</Text>
              <Text style={styles.text}>Węglowodany: {item.values.carbs} g</Text>
              <Text style={styles.text}>Magnez: {item.values.magnesium} mg</Text>
              <Text style={styles.text}>Żelazo: {item.values.iron} mg</Text>

              <Pressable
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Usuń</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={styles.sectionTitle}>Suma posiłku</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Kalorie: {totals.kcal} kcal</Text>
        <Text style={styles.text}>Białko: {totals.protein} g</Text>
        <Text style={styles.text}>Tłuszcz: {totals.fat} g</Text>
        <Text style={styles.text}>Węglowodany: {totals.carbs} g</Text>
        <Text style={styles.text}>Magnez: {totals.magnesium} mg</Text>
        <Text style={styles.text}>Żelazo: {totals.iron} mg</Text>
      </View>

      <Pressable onPress={handleSaveMeal} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Zapisz posiłek</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  list: {
    gap: 6,
  },
  productButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  productButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  productName: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  productNameActive: {
    color: '#FFFFFF',
  },
  productMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  productMetaActive: {
    color: '#CBD5E1',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#0F172A',
  },
  categoryButtonActive: {
    backgroundColor: '#0F172A',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  gramButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
  },
  gramButtonText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  empty: {
    color: '#64748B',
  },
  helperText: {
    color: '#64748B',
    fontSize: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  text: {
    color: '#334155',
  },
});