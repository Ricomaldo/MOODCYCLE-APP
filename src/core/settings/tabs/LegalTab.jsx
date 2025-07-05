//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/shared/tabs/LegalTab.jsx
// 🧩 Type: Tab Component
// 📚 Description: Onglet Légal - documents légaux avec placeholders
// 🕒 Version: 1.0 - 2025-01-15
// ─────────────────────────────────────────────────────────
//
import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { Heading3, BodyText, Caption } from '../../ui/typography';

// 🍎 Documents légaux avec statuts pour Apple compliance
const LEGAL_DOCUMENTS = [
  {
    id: 'privacy',
    title: 'Politique de confidentialité',
    icon: '🔒',
    status: 'draft',
    required: true,
    appleRequired: true,
    description: 'Comment nous protégeons tes données personnelles',
    placeholder: 'Document en cours de rédaction par l\'équipe juridique.\nContiendra les informations sur la collecte, l\'utilisation et la protection de tes données de santé.'
  },
  {
    id: 'terms',
    title: 'Conditions d\'utilisation',
    icon: '📜',
    status: 'draft',
    required: true,
    appleRequired: true,
    description: 'Conditions d\'usage de l\'application',
    placeholder: 'Document en cours de rédaction.\nDéfinira les conditions d\'utilisation et les responsabilités.'
  },
  {
    id: 'health',
    title: 'Avertissement médical',
    icon: '🩺',
    status: 'available',
    required: true,
    appleRequired: true,
    description: 'Important : cette app ne remplace pas un avis médical',
    content: 'Cette application est destinée à des fins d\'information et de bien-être uniquement.\n\nElle ne remplace pas l\'avis d\'un professionnel de santé.\n\nConsultez toujours un médecin pour tout problème de santé.'
  },
  {
    id: 'data',
    title: 'Gestion des données de santé',
    icon: '🏥',
    status: 'draft',
    required: true,
    appleRequired: true,
    description: 'Comment nous traitons tes données de cycle',
    placeholder: 'Document détaillé en préparation.\nExpliquera comment tes données de cycle menstruel sont collectées, stockées et sécurisées.'
  },
  {
    id: 'mentions',
    title: 'Mentions légales',
    icon: '⚖️',
    status: 'draft',
    required: false,
    appleRequired: false,
    description: 'Informations légales sur l\'entreprise',
    placeholder: 'Document en cours de rédaction.\nContiendra les informations légales sur l\'entreprise.'
  }
];

const getStatusConfig = (theme) => ({
  draft: {
    label: 'En cours',
    color: theme.colors.warning,
    icon: '⏳'
  },
  available: {
    label: 'Disponible',
    color: theme.colors.success,
    icon: '✅'
  },
  updated: {
    label: 'Mis à jour',
    color: theme.colors.primary,
    icon: '🆕'
  }
});

export default function LegalTab({ onDataChange }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const STATUS_CONFIG = getStatusConfig(theme);
  
  const handleDocumentPress = (document) => {
    if (document.status === 'available' && document.content) {
      // Afficher le contenu disponible
      Alert.alert(
        document.title,
        document.content,
        [{ text: 'Compris', style: 'default' }]
      );
    } else {
      // Placeholder pour documents en cours
      Alert.alert(
        'Document en préparation',
        document.placeholder || 'Ce document sera disponible dans une prochaine version.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const renderLegalCard = (document) => {
    const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.draft;
    
    return (
      <TouchableOpacity
        key={document.id}
        style={[
          styles.legalCard,
          document.appleRequired && styles.legalCardRequired
        ]}
        onPress={() => handleDocumentPress(document)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <BodyText style={styles.docIcon}>{document.icon}</BodyText>
            <View style={styles.docInfo}>
              <BodyText style={styles.docTitle}>{document.title}</BodyText>
              <Caption style={styles.docDescription}>{document.description}</Caption>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <BodyText style={[styles.statusIcon, { color: statusConfig.color }]}>
                {statusConfig.icon}
              </BodyText>
              <Caption style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Caption>
            </View>
            
            {document.appleRequired && (
              <View style={styles.appleBadge}>
                <Caption style={styles.appleText}>Apple requis</Caption>
              </View>
            )}
          </View>
        </View>
        
        {document.status === 'draft' && (
          <View style={styles.draftNotice}>
            <Feather name="edit-3" size={14} color={theme.colors.textLight} />
            <Caption style={styles.draftText}>
              Document en cours de rédaction par l'équipe juridique
            </Caption>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header compliance */}
      <View style={styles.header}>
        <Heading3 style={styles.headerTitle}>Informations légales</Heading3>
        <Caption style={styles.headerDescription}>
          Tous les documents légaux et informations de conformité. 
          Les documents marqués "Apple requis" sont obligatoires pour l'App Store.
        </Caption>
      </View>

      {/* Documents légaux */}
      <View style={styles.documentsSection}>
        {LEGAL_DOCUMENTS.map(renderLegalCard)}
      </View>

      {/* Section App Store compliance */}
      <View style={styles.complianceSection}>
        <View style={styles.complianceHeader}>
          <Feather name="shield" size={20} color={theme.colors.primary} />
          <BodyText style={styles.complianceTitle}>Conformité App Store</BodyText>
        </View>
        <Caption style={styles.complianceText}>
          Cette application respecte les guidelines Apple pour les apps de santé et bien-être. 
          Tous les documents requis seront finalisés avant la soumission sur l'App Store.
        </Caption>
      </View>

      {/* Placeholder timeline */}
      <View style={styles.timelineSection}>
        <BodyText style={styles.timelineTitle}>Prochaines étapes</BodyText>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <Caption style={styles.timelineText}>Finalisation documents légaux - Q1 2025</Caption>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <Caption style={styles.timelineText}>Validation juridique - Q1 2025</Caption>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <Caption style={styles.timelineText}>Soumission App Store - Q1 2025</Caption>
        </View>
      </View>

      {/* Footer version info */}
      <View style={styles.footer}>
        <Caption style={styles.versionText}>Version 1.0.0 • Build 2025.1</Caption>
        <Caption style={styles.footerText}>
          Développé avec ❤️ pour accompagner ton cycle
        </Caption>
      </View>
      
      {/* Espacement pour le footer */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
  },
  
  headerTitle: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  headerDescription: {
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  
  // Documents
  documentsSection: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  
  legalCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  
  legalCardRequired: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  
  docIcon: {
    fontSize: 24,
    marginRight: theme.spacing.m,
    marginTop: 2,
  },
  
  docInfo: {
    flex: 1,
  },
  
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  docDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  
  headerRight: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.xs,
  },
  
  statusIcon: {
    fontSize: 12,
    marginRight: theme.spacing.xs,
  },
  
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  appleBadge: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small,
  },
  
  appleText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  draftNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  draftText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.s,
    fontStyle: 'italic',
  },
  
  // Compliance
  complianceSection: {
    margin: theme.spacing.l,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.primary + '05',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  complianceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.s,
  },
  
  complianceText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  
  // Timeline
  timelineSection: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.m,
  },
  
  timelineText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  
  // Footer
  footer: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  
  versionText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  
  footerText: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
});
 