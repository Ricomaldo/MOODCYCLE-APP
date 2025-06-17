import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../config/theme';
import { Heading, BodyText } from '../../../components/Typography';

export default function NotebookScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Heading style={styles.title}>Mon Carnet</Heading>
      <BodyText style={styles.description}>
        Ici tu pourras noter tes observations, ressentis et réflexions sur ton cycle.
      </BodyText>
      <BodyText style={styles.comingSoon}>
        Cette fonctionnalité arrive bientôt...
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  description: {
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    opacity: 0.7,
  },
  comingSoon: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.5,
  },
}); 