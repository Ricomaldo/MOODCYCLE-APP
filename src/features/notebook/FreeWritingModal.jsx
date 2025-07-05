//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/FreeWritingModal.jsx
// 🧩 Type: UI Component Premium
// 📚 Description: Expérience d'écriture fluide avec AI contextuel
// 🕒 Version: 6.0 - 2025-06-26 - AI CONTEXTUAL PATTERNS
// 🧭 Patterns: Progressive Disclosure + AI Assistance + Flow State
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Heading2, BodyText, Caption } from '../../core/ui/typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useUserStore } from '../../stores/useUserStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { getCurrentPhase } from '../../utils/cycleCalculations';
import { PhaseIcon } from '../../config/iconConstants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.92;

// ✅ Prompts enrichis par phase avec intelligence contextuelle
const ENHANCED_PROMPTS = {
  menstruelle: {
    category: 'Accueil & Réconfort',
    prompts: [
      { text: "Comment ton corps te parle aujourd'hui ?", type: 'introspection', tags: ['#corps', '#écoute'] },
      { text: "Qu'est-ce qui pourrait t'apporter du réconfort maintenant ?", type: 'care', tags: ['#soin', '#douceur'] },
      { text: "Une gratitude pour ce que ton corps traverse...", type: 'gratitude', tags: ['#gratitude', '#force'] },
      { text: "Quel rythme ton énergie te demande-t-elle ?", type: 'energy', tags: ['#énergie', '#rythme'] }
    ]
  },
  folliculaire: {
    category: 'Renaissance & Projets',
    prompts: [
      { text: "Quelles graines veux-tu planter ce cycle ?", type: 'intention', tags: ['#projets', '#intentions'] },
      { text: "Qu'est-ce qui éveille ta curiosité en ce moment ?", type: 'exploration', tags: ['#curiosité', '#découverte'] },
      { text: "Comment cette énergie montante veut-elle s'exprimer ?", type: 'expression', tags: ['#créativité', '#expression'] },
      { text: "Quel apprentissage t'appelle ?", type: 'growth', tags: ['#apprentissage', '#évolution'] }
    ]
  },
  ovulatoire: {
    category: 'Rayonnement & Connexion',
    prompts: [
      { text: "Comment veux-tu partager tes dons avec le monde ?", type: 'sharing', tags: ['#partage', '#dons'] },
      { text: "Quel message ton cœur veut-il transmettre ?", type: 'message', tags: ['#message', '#cœur'] },
      { text: "Comment célébrer cette énergie créatrice ?", type: 'celebration', tags: ['#célébration', '#créativité'] },
      { text: "Quelle connexion profonde recherches-tu ?", type: 'connection', tags: ['#connexion', '#authenticité'] }
    ]
  },
  lutéale: {
    category: 'Sagesse & Introspection',
    prompts: [
      { text: "Quelles leçons ce cycle t'a-t-il offertes ?", type: 'wisdom', tags: ['#leçons', '#sagesse'] },
      { text: "De quoi as-tu besoin pour bien clôturer ?", type: 'closure', tags: ['#clôture', '#besoins'] },
      { text: "Qu'est-ce qui mérite d'être lâché ?", type: 'release', tags: ['#lâcher-prise', '#libération'] },
      { text: "Comment honorer ta sensibilité aujourd'hui ?", type: 'sensitivity', tags: ['#sensibilité', '#honneur'] }
    ]
  }
};

export default function FreeWritingModal({ 
  visible, 
  onClose, 
  initialPrompt, 
  suggestedTags: propSuggestedTags = [],
  mode = 'free' // 'free', 'guided', 'vignette'
}) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { addEntry } = useNotebookStore();
  const { persona, firstName } = useUserStore();
  // ✅ UTILISATION DIRECTE DU STORE ZUSTAND
  const cycleData = useCycleStore((state) => state);
  const currentPhase = getCurrentPhase(cycleData.lastPeriodDate, cycleData.length, cycleData.periodDuration);

  // États principaux
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showAIAssistance, setShowAIAssistance] = useState(false);
  const [writingMode, setWritingMode] = useState('compose'); // 'compose', 'reflect', 'explore'
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  
  // Refs pour animations
  const modalTranslateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef(null);

  // ✅ Prompts contextuels selon phase et persona
  const contextualPrompts = useMemo(() => {
    const phasePrompts = ENHANCED_PROMPTS[currentPhase] || ENHANCED_PROMPTS.menstruelle;
    let prompts = [...phasePrompts.prompts];
    
    // Ajouter prompt initial de vignette en premier
    if (initialPrompt && !prompts.some(p => p.text === initialPrompt)) {
      prompts.unshift({
        text: initialPrompt,
        type: 'vignette',
        tags: ['#vignette', '#guidé', `#${currentPhase}`]
      });
    }
    
    // Personnalisation selon persona (exemple Emma vs Christine)
    if (persona === 'emma') {
      prompts.push({
        text: "Quelle nouvelle chose as-tu découverte sur toi ?",
        type: 'discovery',
        tags: ['#découverte', '#moi']
      });
    } else if (persona === 'christine') {
      prompts.push({
        text: "Comment cette expérience enrichit-elle ta sagesse ?",
        type: 'wisdom',
        tags: ['#sagesse', '#expérience']
      });
    }
    
    return prompts;
  }, [currentPhase, initialPrompt, persona]);

  // ✅ AI Analysis en temps réel (simulation)
  const analyzeContent = useCallback((text) => {
    if (text.length < 20) return [];
    
    const suggestions = [];
    const words = text.toLowerCase();
    
    // Détection d'émotions
    if (words.includes('fatigue') || words.includes('épuisé')) {
      suggestions.push({
        type: 'care',
        text: "💤 Et si tu t'accordais une pause bien méritée ?",
        action: 'suggest_rest'
      });
    }
    
    if (words.includes('stress') || words.includes('anxieux')) {
      suggestions.push({
        type: 'technique',
        text: "🌊 Essaie la respiration 4-7-8 pour retrouver ton calme",
        action: 'breathing_exercise'
      });
    }
    
    if (words.includes('joie') || words.includes('heureux')) {
      suggestions.push({
        type: 'amplify',
        text: "✨ Continue à décrire ce qui nourrit cette joie !",
        action: 'explore_positive'
      });
    }
    
    // Suggestions de tags intelligentes
    const autoTags = [];
    if (words.includes('rêve') || words.includes('songe')) autoTags.push('#rêves');
    if (words.includes('famille') || words.includes('proche')) autoTags.push('#relations');
    if (words.includes('travail') || words.includes('boulot')) autoTags.push('#professionnel');
    if (words.includes('nature') || words.includes('dehors')) autoTags.push('#nature');
    
    return { suggestions, autoTags };
  }, []);

  // ✅ Analyse en temps réel avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.length > 20) {
        const analysis = analyzeContent(content);
        setAISuggestions(analysis.suggestions);
        
        // Auto-suggest tags without auto-selecting
        const newAutoTags = analysis.autoTags.filter(tag => 
          !selectedTags.includes(tag) && !propSuggestedTags.includes(tag)
        );
        // Just suggest, don't auto-select
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content, selectedTags, propSuggestedTags]);

  // ✅ Animation modal entrée
  useEffect(() => {
    if (visible) {
      setShowPrompts(!!initialPrompt);
      
      Animated.parallel([
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset states
      setContent('');
      setSelectedTags([]);
      setShowPrompts(false);
      setShowAIAssistance(false);
      setAISuggestions([]);
      setFocusMode(false);
      modalTranslateY.setValue(MODAL_HEIGHT);
      contentOpacity.setValue(0);
    }
  }, [visible]);

  // ✅ Swipe to dismiss
  const onGestureEvent = useMemo(() => 
    Animated.event([
      { nativeEvent: { translationY: modalTranslateY } }
    ], { useNativeDriver: true }), [modalTranslateY]);

  const onHandlerStateChange = useCallback((event) => {
    if (event.nativeEvent.state === 5) { // 5 = END state
      const { translationY, velocityY } = event.nativeEvent;
      
      if (translationY > 100 || velocityY > 500) {
        onClose();
      } else {
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [onClose]);

  // ✅ Handlers optimisés
  const handleSave = useCallback(() => {
    if (content.trim().length === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const finalTags = [
      `#${currentPhase}`,
      ...selectedTags,
      ...(mode === 'vignette' ? ['#vignette'] : [])
    ];
    
    addEntry(content, 'personal', finalTags);
    onClose();
  }, [content, selectedTags, currentPhase, mode, addEntry, onClose]);

  const handlePromptSelect = useCallback((prompt) => {
    const personalizedPrompt = firstName 
      ? prompt.text.replace(/tu /g, `${firstName}, tu `)
      : prompt.text;
    
    const newContent = content ? `${content}\n\n${personalizedPrompt}` : personalizedPrompt;
    setContent(newContent);
    
    // Auto-add prompt tags
    if (prompt.tags) {
      const newTags = prompt.tags.filter(tag => !selectedTags.includes(tag));
      setSelectedTags(prev => [...prev, ...newTags]);
    }
    
    setShowPrompts(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Focus text input
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 300);
  }, [content, firstName, selectedTags]);

  const handleAISuggestionSelect = useCallback((suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    switch (suggestion.action) {
      case 'suggest_rest':
        setContent(prev => prev + "\n\n💤 Prendre du temps pour me reposer...");
        break;
      case 'breathing_exercise':
        setContent(prev => prev + "\n\n🌊 Respirer profondément... 4 temps inspiration, 7 temps retenue, 8 temps expiration...");
        break;
      case 'explore_positive':
        setContent(prev => prev + "\n\nCe qui nourrit cette joie : ");
        break;
    }
  }, []);

  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // ✅ Suggestions tags enrichies
  const allSuggestedTags = useMemo(() => {
    const baseTags = [
      ...propSuggestedTags,
      '#gratitude', '#réflexion', '#découverte', '#émotion'
    ];
    
    // Ajouter tags contextuels selon phase
    const phaseTags = {
      menstruelle: ['#repos', '#introspection', '#douceur'],
      folliculaire: ['#projets', '#énergie', '#nouveauté'],
      ovulatoire: ['#créativité', '#partage', '#confiance'],
      lutéale: ['#bilan', '#sagesse', '#préparation']
    };
    
    const contextTags = phaseTags[currentPhase] || [];
    
    return [...new Set([...baseTags, ...contextTags])];
  }, [propSuggestedTags, currentPhase]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                transform: [{ translateY: modalTranslateY }]
              }
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              {/* Handle iOS */}
              <View style={styles.handle} />

              <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
                
                {/* ═══ HEADER CONTEXTUEL ═══ */}
                {!focusMode && (
                  <View style={styles.header}>
                    <View style={styles.headerLeft}>
                      <PhaseIcon 
                        phaseKey={currentPhase}
                        size={20}
                        color="white"
                      />
                      <View style={styles.headerText}>
                        <Heading2 style={[styles.title, { color: theme.colors.phases[currentPhase] }]}>
                          Mon Journal
                        </Heading2>
                        <Caption style={styles.phaseCategory}>
                          {ENHANCED_PROMPTS[currentPhase]?.category || 'Écriture libre'}
                        </Caption>
                      </View>
                    </View>
                    
                    <View style={styles.headerActions}>
                      <TouchableOpacity 
                        onPress={() => setShowPrompts(!showPrompts)} 
                        style={[styles.actionButton, showPrompts && styles.actionButtonActive]}
                      >
                        <Feather name="compass" size={20} color={showPrompts ? 'white' : theme.colors.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={toggleFocusMode}
                        style={styles.actionButton}
                      >
                        <Feather name="minimize-2" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity onPress={onClose} style={styles.actionButton}>
                        <Feather name="x" size={20} color={theme.colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* ═══ PROMPTS INSPIRANTS ═══ */}
                {showPrompts && !focusMode && (
                  <View style={styles.promptsSection}>
                    <Caption style={styles.promptsTitle}>
                      💫 Inspirations pour ta phase {currentPhase}
                    </Caption>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {contextualPrompts.map((prompt, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.promptPill,
                            theme.getPhaseGlassmorphismStyle(currentPhase, {
                              borderRadius: 16,
                              shadowOpacity: 0,  // Pas de shadow sur les pills
                            })
                          ]}
                          onPress={() => handlePromptSelect(prompt)}
                        >
                          <BodyText style={[styles.promptText, { color: theme.colors.phases[currentPhase] }]}>
                            {prompt.text}
                          </BodyText>
                          <Caption style={[styles.promptType, { color: theme.colors.phases[currentPhase] + 'AA' }]}>
                            {prompt.type}
                          </Caption>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* ═══ ZONE D'ÉCRITURE PRINCIPALE ═══ */}
                <View style={styles.writingZone}>
                  <TextInput
                    ref={textInputRef}
                    style={[
                      styles.textInput, 
                      focusMode && styles.textInputFocus
                    ]}
                    placeholder={`${firstName ? `${firstName}, ` : ''}laisse tes pensées s'exprimer librement...`}
                    placeholderTextColor={theme.colors.textLight}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    textAlignVertical="top"
                    autoFocus
                    scrollEnabled={true}
                  />

                  {/* AI Assistance contextuelle */}
                  {aiSuggestions.length > 0 && !focusMode && (
                    <View style={styles.aiAssistance}>
                      <Caption style={styles.aiTitle}>💡 MéLune suggère</Caption>
                      {aiSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.aiSuggestion}
                          onPress={() => handleAISuggestionSelect(suggestion)}
                        >
                          <BodyText style={styles.aiSuggestionText}>{suggestion.text}</BodyText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Compteur de mots avec encouragement */}
                  <View style={styles.writingStats}>
                    <Caption style={styles.charCount}>
                      {content.length} caractères
                      {content.split(' ').filter(w => w.length > 0).length > 0 && 
                        ` • ${content.split(' ').filter(w => w.length > 0).length} mots`
                      }
                    </Caption>
                    {content.length > 100 && (
                      <Caption style={styles.encouragement}>
                        ✨ Belle expression !
                      </Caption>
                    )}
                  </View>
                </View>

                {/* ═══ TAGS INTELLIGENTS ═══ */}
                {!focusMode && allSuggestedTags.length > 0 && (
                  <View style={styles.tagsSection}>
                    <Caption style={styles.tagsTitle}>Étiquettes suggérées :</Caption>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {allSuggestedTags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.tagPill, 
                            selectedTags.includes(tag) && [
                              styles.tagPillSelected,
                              { backgroundColor: theme.colors.phases[currentPhase] + '20' }
                            ]
                          ]}
                          onPress={() => toggleTag(tag)}
                        >
                          <BodyText
                            style={[
                              styles.tagText,
                              selectedTags.includes(tag) && [
                                styles.tagTextSelected,
                                { color: theme.colors.phases[currentPhase] }
                              ]
                            ]}
                          >
                            {tag}
                          </BodyText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* ═══ TAGS SÉLECTIONNÉS ═══ */}
                {selectedTags.length > 0 && !focusMode && (
                  <View style={styles.selectedTagsSection}>
                    <View style={styles.selectedTags}>
                      {selectedTags.map((tag, index) => (
                        <View 
                          key={index} 
                          style={[
                            styles.selectedTag,
                            theme.getPhaseGlassmorphismStyle(currentPhase, {
                              bgOpacity: '',  // Couleur pleine pour les tags sélectionnés
                              borderWidth: 0,
                              shadowOpacity: 0,
                            })
                          ]}
                        >
                          <BodyText style={styles.selectedTagText}>{tag}</BodyText>
                          <TouchableOpacity
                            onPress={() => toggleTag(tag)}
                            style={styles.removeTagButton}
                          >
                            <Feather name="x" size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* ═══ ACTIONS BOTTOM ═══ */}
                <View style={styles.actions}>
                  {focusMode ? (
                    <TouchableOpacity 
                      style={styles.focusExitButton} 
                      onPress={toggleFocusMode}
                    >
                      <Feather name="maximize-2" size={20} color={theme.colors.primary} />
                      <BodyText style={styles.focusExitText}>Quitter focus</BodyText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                      <BodyText style={styles.cancelButtonText}>Annuler</BodyText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: theme.colors.phases[currentPhase] },
                      content.trim().length === 0 && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={content.trim().length === 0}
                  >
                    <Feather name="save" size={20} color="white" />
                    <BodyText style={styles.saveButtonText}>
                      Sauvegarder {content.trim() && `(${content.trim().split(' ').length} mots)`}
                    </BodyText>
                  </TouchableOpacity>
                </View>

              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // ═══ HEADER ═══
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: 14,
    color: 'white',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  phaseCategory: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primary,
  },

  // ═══ PROMPTS ═══
  promptsSection: {
    marginBottom: 16,
  },
  promptsTitle: {
    marginBottom: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  promptPill: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 200,
    maxWidth: 280,
  },
  promptText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  promptType: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ═══ WRITING ZONE ═══
  writingZone: {
    flex: 1,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    textAlignVertical: 'top',
    paddingVertical: 16,
    minHeight: 200,
  },
  textInputFocus: {
    fontSize: 19,
    lineHeight: 28,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background + '50',
    borderRadius: 12,
  },
  writingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  charCount: {
    color: theme.colors.textLight,
  },
  encouragement: {
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // ═══ AI ASSISTANCE ═══
  aiAssistance: {
    backgroundColor: theme.colors.primary + '08',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  aiTitle: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiSuggestion: {
    paddingVertical: 8,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },

  // ═══ TAGS ═══
  tagsSection: {
    marginBottom: 12,
  },
  tagsTitle: {
    marginBottom: 8,
    color: theme.colors.textLight,
    fontSize: 12,
    fontWeight: '500',
  },
  tagPill: {
    backgroundColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagPillSelected: {
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  tagTextSelected: {
    fontWeight: '600',
  },
  selectedTagsSection: {
    marginBottom: 16,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    padding: 2,
  },

  // ═══ ACTIONS ═══
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: theme.colors.textLight,
    fontSize: 16,
  },
  focusExitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  focusExitText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textLight,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});