import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Quintessential_400Regular } from '@expo-google-fonts/quintessential';
import { Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quintessential_400Regular,
    Quicksand_400Regular,
    Quicksand_700Bold,
  });

  // Hook pour surveiller la connexion réseau
  useNetworkStatus();

  // Attendre que les polices soient chargées
  if (!fontsLoaded) {
    return null; // Ou un écran de chargement
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="onboarding" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}