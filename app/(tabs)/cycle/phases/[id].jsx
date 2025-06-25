//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : app/(tabs)/cycle/phases/[id].jsx
// 🧩 Type : Composant Écran
// 📚 Description : Composant affichant l'écran principal
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : /notebook cycle route
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useTheme } from "../../../../src/hooks/useTheme";
import ContentManager from "../../../../src/services/ContentManager";
import { Heading, BodyText, Caption } from "../../../../src/core/ui/Typography";

export default function PhaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [phaseData, setPhaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const loadPhaseData = async () => {
      try {
        const phases = await ContentManager.getPhases();
        setPhaseData(phases[id]); // id depuis useLocalSearchParams
      } catch (error) {
        console.log("📱 Fallback vers phases.json local");
        const phases = require("../../../../src/data/phases.json");
        setPhaseData(phases[id]);
      } finally {
        setLoading(false);
      }
    };
    loadPhaseData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <BodyText>Chargement...</BodyText>
      </View>
    );
  }

  if (!phaseData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <BodyText>Phase non trouvée</BodyText>
      </View>
    );
  }

  // Calcul automatique de la couleur de texte selon le fond de la phase
  const headerTextColor = theme.getTextColorOn(phaseData.color);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header unifié avec contraste automatique */}
      <View
        style={[styles.unifiedHeader, { backgroundColor: phaseData.color }]}
      >
        <View style={styles.navigationRow}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={headerTextColor} />
          </TouchableOpacity>
          <BodyText style={[styles.breadcrumb, { color: headerTextColor }]}>
            Mon cycle
          </BodyText>
        </View>
        <Heading style={[styles.title, { color: headerTextColor }]}>
          {phaseData.name}
        </Heading>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Ligne avec icône et durée */}
          <View style={styles.durationRow}>
            <BodyText style={styles.symbolSmall}>{phaseData.symbol}</BodyText>
            <Caption style={styles.duration}>{phaseData.duration}</Caption>
          </View>

          <BodyText style={styles.description}>
            {phaseData.description}
          </BodyText>

          <Heading style={styles.sectionTitle}>Caractéristiques</Heading>
          <View style={styles.section}>
            {phaseData.characteristics.physical.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Conseils</Heading>
          <View style={styles.section}>
            {phaseData.advice.nutrition.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          <BodyText style={styles.affirmation}>
            "{phaseData.affirmation}"
          </BodyText>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  unifiedHeader: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.s,
  },
  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  backButton: {
    marginRight: theme.spacing.m,
  },
  breadcrumb: {
    fontSize: 16,
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.m,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.s,
  },
  symbolSmall: {
    fontSize: 16,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  duration: {
    fontSize: 18,
    color: theme.colors.text,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  section: {
    marginBottom: theme.spacing.m,
  },
  listItem: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  affirmation: {
    fontSize: 18,
    fontStyle: "italic",
    color: theme.colors.text,
    textAlign: "center",
    marginTop: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
});
