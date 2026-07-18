import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = 'nutriminar_premium';

export async function isPremium(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PREMIUM_KEY);
  return value === 'true';
}

export async function activatePremium() {
  await AsyncStorage.setItem(PREMIUM_KEY, 'true');
}

export async function deactivatePremium() {
  await AsyncStorage.setItem(PREMIUM_KEY, 'false');
}