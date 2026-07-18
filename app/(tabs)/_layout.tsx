import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Start' }} />
      <Tabs.Screen name="add-meal" options={{ title: 'Dodaj' }} />
      <Tabs.Screen name="history" options={{ title: 'Historia' }} />
      <Tabs.Screen name="goals" options={{ title: 'Cele' }} />
      <Tabs.Screen name="premium" options={{ title: 'Premium' }} />
    </Tabs>
  );
}