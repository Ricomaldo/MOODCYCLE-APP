//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/settings/ParametresModal.jsx
// 🧩 Type: Modal Component
// 📚 Description: Modal Paramètres avec onglets (Profil, Préférences, Persona, Légal)
// 🕒 Version: 1.0 - 2025-01-15
// 🧭 Used in: Navigation principale via bouton paramètres
// ─────────────────────────────────────────────────────────
//
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Heading2, BodyText, Caption } from '../ui/typography';
import { useUserStore } from '../../stores/useUserStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';
import { useTheme } from '../../hooks/useTheme';

// Import des onglets
import ProfilTab from './tabs/ProfilTab';
import PreferencesTab from './tabs/PreferencesTab';
import MeluneTab from './tabs/MeluneTab';
import LegalTab from './tabs/LegalTab';
import TerminologyTab from './tabs/TerminologyTab';

const { width } = Dimensions.get('window');

const TABS = [
  { id: 'profil', name: 'Profil', icon: 'user' },
  { id: 'preferences', name: 'Préférences', icon: 'sliders' },
  { id: 'terminology', name: 'Terminologie', icon: 'type' },
  { id: 'melune', name: 'Melune', icon: 'heart' },
  { id: 'legal', name: 'Légal', icon: 'shield' }
];

export default function ParametresModal({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  
  // Store & hooks
  const { updateProfile, updatePreferences, updateMelune } = useUserStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);
  const theme = useTheme();
  const styles = getStyles(theme);
  
  // Phase color pour le header
  const phaseColor = theme.colors.phases[currentPhase] || theme.colors.primary;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animation slide
    Animated.timing(tabSlideAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tabId);
      tabSlideAnim.setValue(0);
      Animated.timing(tabSlideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSave = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setHasChanges(false);
    // Les changements sont déjà sauvés en temps réel via les stores
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      // Ici on pourrait ajouter une confirmation si nécessaire
    }
    onClose();
  };

  const renderTabContent = () => {
    const commonProps = {
      onDataChange: () => setHasChanges(true)
    };

    switch (activeTab) {
      case 'profil':
        return <ProfilTab {...commonProps} />;
      case 'preferences':
        return <PreferencesTab {...commonProps} />;
      case 'terminology':
        return <TerminologyTab {...commonProps} />;
      case 'melune':
        return <MeluneTab {...commonProps} />;
      case 'legal':
        return <LegalTab {...commonProps} />;
      default:
        return <ProfilTab {...commonProps} />;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header avec couleur de phase */}
          <View style={[styles.header, { borderBottomColor: phaseColor + '30' }]}>
            <View style={styles.headerContent}>
              <Heading2 style={styles.title}>Paramètres</Heading2>
              <Caption style={[styles.phaseIndicator, { color: phaseColor }]}>
                Phase {currentPhase}
              </Caption>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Navigation par onglets */}
          <View style={styles.tabsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {TABS.map((tab, index) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && [
                  styles.tabActive, 
                  theme.getGlassmorphismStyle(phaseColor, {
                    bgOpacity: theme.glassmorphism.opacity.bg,
                    borderOpacity: theme.glassmorphism.opacity.border,
                    borderWidth: 1,
                    shadowOpacity: 0,
                  })
                ]
                  ]}
                  onPress={() => handleTabChange(tab.id)}
                >
                  <Feather 
                    name={tab.icon} 
                    size={16} 
                    color={activeTab === tab.id ? phaseColor : theme.colors.textLight} 
                  />
                  <BodyText style={[
                    styles.tabText,
                    { color: activeTab === tab.id ? phaseColor : theme.colors.textLight }
                  ]}>
                    {tab.name}
                  </BodyText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contenu de l'onglet actif */}
          <Animated.View 
            style={[
              styles.tabContent,
              {
                transform: [{
                  translateX: tabSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.1]
                  })
                }],
                opacity: tabSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0]
                })
              }
            ]}
          >
            {renderTabContent()}
          </Animated.View>

          {/* Footer avec bouton de sauvegarde */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                hasChanges && { backgroundColor: phaseColor }
              ]}
              onPress={handleSave}
            >
              <Feather 
                name="check" 
                size={20} 
                color={hasChanges ? 'white' : theme.colors.textLight} 
              />
              <BodyText style={[
                styles.saveButtonText,
                { color: hasChanges ? 'white' : theme.colors.textLight }
              ]}>
                {hasChanges ? 'Sauvegarder' : 'Tout est sauvé'}
              </BodyText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    width: '100%',
    height: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderBottomWidth: 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  phaseIndicator: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    padding: theme.spacing.s,
    marginTop: -theme.spacing.s,
  },
  
  // Onglets
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.s,
    minWidth: 80,
  },
  tabActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  
  // Contenu
  tabContent: {
    flex: 1,
  },
  
  // Footer
  footer: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.s,
  },
}); 