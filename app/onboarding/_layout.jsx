//
// ─────────────────────────────────────────────────────────
// 📄 File: app/onboarding/_layout.jsx  
// 🧩 Type: Layout Navigation
// 📚 Description: Stack navigation onboarding avec écrans ordonnés
// 🕒 Version: 3.1 - 2025-06-23 - STOP SLIDE ANIMATION
// 🧭 Used in: Onboarding flow - Révélation cyclique (8 étapes)
// ─────────────────────────────────────────────────────────
//
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        // ✨ ANIMATIONS ÉTÉ 2025 - Transitions fluides et modernes
        animation: 'fade_from_bottom',
        presentation: 'card',
        transitionSpec: {
          open: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: 'easeInOut',
            },
          },
        },
        // ✨ Interpolation personnalisée pour un effet "breath"
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height * 0.1, 0],
                  }),
                },
                {
                  scale: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.8, 1],
              }),
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="100-bienvenue" 
        options={{
          gestureEnabled: false,
          animation: 'none',
          presentation: 'card',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="200-rencontre" 
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="300-etape-vie"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="400-cycle"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="500-preferences"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="550-prenom"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="600-avatar"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="650-terminology"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="700-essai"
        options={{
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
      <Stack.Screen 
        name="800-demarrage"
        options={{
          gestureEnabled: false,
          animation: 'none',
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 0 } },
            close: { animation: 'timing', config: { duration: 0 } },
          },
        }}
      />
    </Stack>
  );
}