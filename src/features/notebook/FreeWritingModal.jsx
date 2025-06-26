//
// ─────────────────────────────────────────────────────────
// 📄 File: src/features/notebook/FreeWritingModal.jsx
// 🧩 Type: UI Component
// 📚 Description: Modal d'écriture libre pour le carnet, avec suggestions selon la phase
// 🕒 Version: 3.0 - 2025-06-21
// 🧭 Used in: notebook screen, free writing, shared notebook UI
// ─────────────────────────────────────────────────────────
//
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Heading2, BodyText, Caption } from '../../core/ui/Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useUserStore } from '../../stores/useUserStore';
import { useCycle } from '../../hooks/useCycle';
import { PhaseIndicator } from '../../utils/formatters';

const PROMPTS_BY_PHASE = {
  menstruelle: [
    "Comment te sens-tu aujourd'hui ?",
    "Qu'est-ce que ton corps te demande ?",
    'Une chose pour laquelle tu es reconnaissante...',
  ],
  folliculaire: [
    'Quelles sont tes intentions pour ce nouveau cycle ?',
    "Qu'est-ce qui t'inspire en ce moment ?",
    'Un projet qui te fait vibrer...',
  ],
  ovulatoire: [
    'Comment veux-tu utiliser cette énergie créatrice ?',
    'Quel message veux-tu partager au monde ?',
    "Une idée qui mérite d'être explorée...",
  ],
  lutéale: [
    "Qu'est-ce qui mérite d'être lâché ?",
    'De quoi as-tu besoin pour bien terminer ce cycle ?',
    'Une leçon apprise cette semaine...',
  ],
};

export default function FreeWritingModal({ visible, onClose, initialPrompt, suggestedTags: propSuggestedTags }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { addEntry } = useNotebookStore();
  const { currentPhase } = useCycle();

  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Initialiser le contenu avec le prompt de vignette si fourni
  useEffect(() => {
    if (visible && initialPrompt && !content) {
      setContent(initialPrompt);
    }
  }, [visible, initialPrompt]);

  // Initialiser les tags suggérés depuis les props
  useEffect(() => {
    if (visible && propSuggestedTags && propSuggestedTags.length > 0) {
      setSelectedTags(propSuggestedTags);
    }
  }, [visible, propSuggestedTags]);

  // Reset quand la modal se ferme
  useEffect(() => {
    if (!visible) {
      setContent('');
      setSelectedTags([]);
      setSuggestedTags([]);
      setShowPrompts(false);
    }
  }, [visible]);

  const currentPhaseKey = currentPhase || 'menstruelle';
  const prompts = PROMPTS_BY_PHASE[currentPhaseKey] || PROMPTS_BY_PHASE.menstruelle;

  // Mise à jour suggestions tags en temps réel
  useEffect(() => {
    if (content.length > 10) {
      // Logique simple de suggestions basée sur le contenu
      const words = content.toLowerCase().split(' ');
      const suggestions = [];
      
      if (words.includes('fatigue') || words.includes('tired')) suggestions.push('#fatigue');
      if (words.includes('énergie') || words.includes('energy')) suggestions.push('#énergie');
      if (words.includes('douleur') || words.includes('pain')) suggestions.push('#douleur');
      if (words.includes('joie') || words.includes('joy')) suggestions.push('#joie');
      if (words.includes('stress') || words.includes('anxiety')) suggestions.push('#stress');
      
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [content]);

  const handleSave = () => {
    if (content.trim().length === 0) return;

    // Utiliser la nouvelle API simplifiée
    const tags = [`#${currentPhaseKey}`, ...selectedTags];
    addEntry(content, 'personal', tags);

    // Fermer (le reset se fait automatiquement via useEffect)
    onClose();
  };

  const handlePromptSelect = (prompt) => {
    const newContent = content ? `${content}\n\n${prompt}` : prompt;
    setContent(newContent);
    setShowPrompts(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getPhaseEmoji = (phase) => {
    // Mapping des slugs vers les clés de phase
    const phaseMapping = {
      menstruelle: 'menstrual',
      folliculaire: 'follicular', 
      ovulatoire: 'ovulatory',
      luteale: 'luteal'
    };
    const phaseKey = phaseMapping[phase] || phase;
    return getPhaseIcon(phaseKey);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <Heading2 style={styles.title}>
            <PhaseIndicator 
              phase={currentPhase}
              useIcon={true}
              size={24}
              color={theme.colors.text}
            />
            {" "}Mon Journal
          </Heading2>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Prompts suggestions */}
        {showPrompts && (
          <View style={styles.promptsSection}>
            <Caption style={styles.promptsTitle}>Inspirations pour ta phase :</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {prompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptPill}
                  onPress={() => handlePromptSelect(prompt)}
                >
                  <BodyText style={styles.promptText}>{prompt}</BodyText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Zone d'écriture */}
        <View style={styles.writingSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Écris tes pensées, ressentis, découvertes..."
            placeholderTextColor={theme.colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          {/* Compteur caractères */}
          <View style={styles.footer}>
            <Caption style={styles.charCount}>{content.length} caractères</Caption>
          </View>
        </View>

        {/* Tags suggestions */}
        {suggestedTags.length > 0 && (
          <View style={styles.tagsSection}>
            <Caption style={styles.tagsTitle}>Tags suggérés :</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tagPill, selectedTags.includes(tag) && styles.tagPillSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <BodyText
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </BodyText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tags sélectionnés */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedTagsSection}>
            <View style={styles.selectedTags}>
              {selectedTags.map((tag, index) => (
                <View key={index} style={styles.selectedTag}>
                  <BodyText style={styles.selectedTagText}>{tag}</BodyText>
                  <TouchableOpacity
                    onPress={() => toggleTag(tag)}
                    style={styles.removeTagButton}
                  >
                    <Feather name="x" size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <BodyText style={styles.cancelButtonText}>Annuler</BodyText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              content.trim().length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={content.trim().length === 0}
          >
            <Feather name="save" size={20} color="white" />
            <BodyText style={styles.saveButtonText}>Sauvegarder</BodyText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    height: '85%', // Hauteur fixe au lieu de maxHeight
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  phaseLabel: {
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptButton: {
    padding: theme.spacing.s,
    marginRight: theme.spacing.s,
  },
  closeButton: {
    padding: theme.spacing.s,
  },

  // Prompts
  promptsSection: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  promptsTitle: {
    marginBottom: theme.spacing.s,
    color: theme.colors.textLight,
  },
  promptPill: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    maxWidth: 180,
  },
  promptText: {
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: 'center',
  },

  // Zone écriture
  writingSection: {
    flex: 1,
    padding: theme.spacing.l,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.s,
  },
  charCount: {
    color: theme.colors.textLight,
  },

  // Tags
  tagsSection: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  tagsTitle: {
    marginBottom: theme.spacing.s,
    color: theme.colors.textLight,
  },
  tagPill: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagPillSelected: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  tagTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Tags sélectionnés
  selectedTagsSection: {
    padding: theme.spacing.l,
    paddingTop: theme.spacing.m,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingLeft: theme.spacing.m,
    paddingRight: theme.spacing.s,
    paddingVertical: theme.spacing.s,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 12,
    marginRight: theme.spacing.xs,
  },
  removeTagButton: {
    padding: 2,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.l,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
  },
  cancelButtonText: {
    color: theme.colors.textLight,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: theme.spacing.s,
  },
});
