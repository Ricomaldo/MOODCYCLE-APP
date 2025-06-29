import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useTheme } from "../../../../src/hooks/useTheme";
import ContentManager from "../../../../src/services/ContentManager";
import { Heading, BodyText, Caption } from "../../../../src/core/ui/Typography";
import { useTerminology } from "../../../../src/hooks/useTerminology";

export default function PhaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [phaseData, setPhaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { getPhaseLabel } = useTerminology();
  const styles = getStyles(theme);

  useEffect(() => {
    const loadPhaseData = async () => {
      try {
        const phases = await ContentManager.getPhases();
        setPhaseData(phases[id]);
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

  // Extraction editableContent
  const { editableContent, characteristics } = phaseData;
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
          {getPhaseLabel(id)}
        </Heading>
        {/* Badge contenu Jeza */}
        <View style={[styles.badge, { backgroundColor: headerTextColor + '20' }]}>
          <Caption style={[styles.badgeText, { color: headerTextColor }]}>
            ✨ Contenu personnalisé par Jeza
          </Caption>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Ligne avec icône et durée */}
          <View style={styles.durationRow}>
            <BodyText style={styles.symbolSmall}>{phaseData.symbol}</BodyText>
            <Caption style={styles.duration}>{phaseData.duration}</Caption>
          </View>

          <BodyText style={styles.description}>
            {editableContent.description}
          </BodyText>

          {/* Caractéristiques physiques */}
          <Heading style={styles.sectionTitle}>Caractéristiques physiques</Heading>
          <View style={styles.section}>
            {characteristics.physical.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          {/* Caractéristiques émotionnelles */}
          <Heading style={styles.sectionTitle}>Ressenti émotionnel</Heading>
          <View style={styles.section}>
            {characteristics.emotional.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          {/* Conseils Nutrition */}
          <Heading style={styles.sectionTitle}>Nutrition</Heading>
          <View style={styles.section}>
            {editableContent.advice.nutrition.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                🥗 {item}
              </BodyText>
            ))}
          </View>

          {/* Conseils Activités */}
          <Heading style={styles.sectionTitle}>Activités conseillées</Heading>
          <View style={styles.section}>
            {editableContent.advice.activities.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                🌟 {item}
              </BodyText>
            ))}
          </View>

          {/* Conseils Self-care */}
          <Heading style={styles.sectionTitle}>Prendre soin de soi</Heading>
          <View style={styles.section}>
            {editableContent.advice.selfcare.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                💝 {item}
              </BodyText>
            ))}
          </View>

          {/* À éviter */}
          <Heading style={styles.sectionTitle}>À éviter</Heading>
          <View style={styles.section}>
            {editableContent.advice.avoid.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                ⚠️ {item}
              </BodyText>
            ))}
          </View>

          {/* Rituels & Pratiques */}
          <Heading style={styles.sectionTitle}>Rituels & Pratiques</Heading>
          <View style={styles.section}>
            {editableContent.rituals.map((ritual, index) => (
              <View key={index} style={styles.ritualItem}>
                <BodyText style={styles.ritual}>🌸 {ritual}</BodyText>
              </View>
            ))}
          </View>

          {/* Affirmation */}
          <View style={styles.affirmationSection}>
            <BodyText style={styles.affirmation}>
              "{editableContent.affirmation}"
            </BodyText>
          </View>
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
  badge: {
    marginTop: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.m,
    alignSelf: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: theme.spacing.m,
  },
  symbolSmall: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  duration: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  section: {
    marginBottom: theme.spacing.m,
  },
  listItem: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    lineHeight: 22,
  },
  ritualItem: {
    marginBottom: theme.spacing.m,
  },
  ritual: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },
  affirmationSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
  },
  affirmation: {
    fontSize: 18,
    fontStyle: "italic",
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: 26,
  },
});