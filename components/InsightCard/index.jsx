// components/InsightCard/index.jsx
import { View, StyleSheet } from 'react-native';
import { BodyText, Caption } from '../Typography';
import { theme } from '../../config/theme';

export default function InsightCard({ insight, phase = 'menstrual' }) {
  // Calcul automatique de la couleur de texte selon la phase
  const phaseColor = theme.colors.phases[phase];
  const textColor = theme.getTextColorOn(phaseColor);
  const captionColor = textColor === '#FFFFFF' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(33, 33, 33, 0.7)';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: phaseColor }
    ]}>
      <BodyText style={[styles.insightText, { color: textColor }]}>{insight}</BodyText>
      <Caption style={[styles.phaseCaption, { color: captionColor }]}>Phase {phase}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    marginVertical: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    marginBottom: theme.spacing.m,
  },
  phaseCaption: {
    textAlign: 'right',
  },
});
