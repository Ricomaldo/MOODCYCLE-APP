//
// ─────────────────────────────────────────────────────────
// 📄 File: app/(tabs)/cycle/phases/[id].jsx
// 🧩 Type: Écran Détail
// 📚 Description: Détail d'une phase du cycle avec conseils Jeza
// 🕒 Version: 1.0 - 2025-01-21
// 🧭 Used in: Navigation cycle, détails phases
// ─────────────────────────────────────────────────────────
//
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useTheme } from "../../../../src/hooks/useTheme";
import ContentManager from "../../../../src/services/ContentManager";
import { Heading, BodyText, Caption } from '../../../../src/core';
import { useTerminology } from "../../../../src/hooks/useTerminology";

export default function PhaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [phaseData, setPhaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { getPhaseLabel } = useTerminology();
  const styles = getStyles(theme);

  useEffect(() => {
    const loadPhaseData = async () => {
      try {
        const phases = await ContentManager.getPhases();
        setPhaseData(phases[id]);
      } catch (error) {
        console.info("📱 Fallback vers phases.json local");
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

  const { editableContent, characteristics } = phaseData;
  const headerTextColor = theme.getTextColorOn(phaseData.color);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <View style={[
          styles.badge, 
          theme.getGlassmorphismStyle(headerTextColor, {
            bgOpacity: theme.glassmorphism.opacity.medium,
            borderWidth: 0,
            shadowOpacity: 0,
          })
        ]}>
          <Caption style={[styles.badgeText, { color: headerTextColor }]}>
            ✨ Contenu personnalisé par Jeza
          </Caption>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.durationRow}>
            <BodyText style={styles.symbolSmall}>{phaseData.symbol}</BodyText>
            <Caption style={styles.duration}>{phaseData.duration}</Caption>
          </View>

          <BodyText style={styles.description}>
            {editableContent.description}
          </BodyText>

          <Heading style={styles.sectionTitle}>Caractéristiques physiques</Heading>
          <View style={styles.section}>
            {characteristics.physical.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Ressenti émotionnel</Heading>
          <View style={styles.section}>
            {characteristics.emotional.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                • {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Nutrition</Heading>
          <View style={styles.section}>
            {editableContent.advice.nutrition.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                🥗 {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Activités conseillées</Heading>
          <View style={styles.section}>
            {editableContent.advice.activities.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                🌟 {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Prendre soin de soi</Heading>
          <View style={styles.section}>
            {editableContent.advice.selfcare.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                💝 {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>À éviter</Heading>
          <View style={styles.section}>
            {editableContent.advice.avoid.map((item, index) => (
              <BodyText key={index} style={styles.listItem}>
                ⚠️ {item}
              </BodyText>
            ))}
          </View>

          <Heading style={styles.sectionTitle}>Rituels & Pratiques</Heading>
          <View style={styles.section}>
            {editableContent.rituals.map((ritual, index) => (
              <View key={index} style={styles.ritualItem}>
                <BodyText style={styles.ritual}>🌸 {ritual}</BodyText>
              </View>
            ))}
          </View>

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
    fontSize: 14,
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.l,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  symbolSmall: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  duration: {
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: theme.spacing.l,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.l,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.m,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  ritualItem: {
    marginBottom: theme.spacing.xs,
  },
  ritual: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  affirmationSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: 12,
    marginTop: theme.spacing.l,
    alignItems: "center",
  },
  affirmation: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    color: theme.colors.primary,
  },
});