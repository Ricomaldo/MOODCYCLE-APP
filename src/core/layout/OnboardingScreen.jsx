import React from 'react';
import { View, StyleSheet } from 'react-native';
import ScreenContainer from './ScreenContainer';
import OnboardingNavigation from '../../features/shared/OnboardingNavigation';

const OnboardingScreen = ({ 
  children, 
  currentScreen,
  style 
}) => (
  <ScreenContainer edges={['top', 'bottom']}>
    <OnboardingNavigation currentScreen={currentScreen} />
    <View style={[styles.content, style]}>
      {children}
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  }
});

export default OnboardingScreen;
