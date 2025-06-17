import { Redirect } from 'expo-router';

export default function Index() {
  // Pour tester l'onboarding complet depuis le début :
  return <Redirect href="/onboarding/100-promesse" />;
  
  // Redirection normale vers l'app principale :
  // return <Redirect href="/(tabs)/home" />;
} 