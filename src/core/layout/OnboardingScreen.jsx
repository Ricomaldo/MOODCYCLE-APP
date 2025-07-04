import React, { useState, useCallback } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingScreen = ({ 
  children, 
  style 
}) => {
  const pathname = usePathname();
  const isFirstScreen = pathname.endsWith('100-bienvenue');
  const [isReady, setIsReady] = useState(false);
  
  // Animation du contenu
  const contentAnim = React.useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    // Animation du contenu de bas en haut
    Animated.spring(contentAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true
    }).start(() => setIsReady(true));
  }, [contentAnim]);

  React.useEffect(() => {
    // Démarrer l'animation au montage du composant
    const timeout = setTimeout(startAnimation, 50);
    return () => clearTimeout(timeout);
  }, [startAnimation]);

  return (
    <SafeAreaView 
      edges={isFirstScreen ? ['top', 'bottom'] : ['bottom']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          style,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        {children}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  }
});

export default React.memo(OnboardingScreen);
