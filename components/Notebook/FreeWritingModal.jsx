// components/Notebook/FreeWritingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, Modal, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Heading2, BodyText, Caption } from '../Typography';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useCycleStore } from '../../stores/useCycleStore';

const PROMPTS_BY_PHASE = {
  menstruelle: [
    "Comment te sens-tu aujourd'hui ?",
    "Qu'est-ce que ton corps te demande ?",
    "Une chose pour laquelle tu es reconnaissante..."
  ],
  folliculaire: [
    "Quelles sont tes intentions pour ce nouveau cycle ?",
    "Qu'est-ce qui t'inspire en ce moment ?",
    "Un projet qui te fait vibrer..."
  ],
  ovulatoire: [
    "Comment veux-tu utiliser cette énergie créatrice ?",
    "Quel message veux-tu partager au monde ?",
    "Une idée qui mérite d'être explorée..."
  ],
  lutéale: [
    "Qu'est-ce qui mérite d'être lâché ?",
    "De quoi as-tu besoin pour bien terminer ce cycle ?",
    "Une leçon apprise cette semaine..."
  ]
};

export default function FreeWritingModal({ visible, onClose }) {
  const { addEntry, getSuggestedTags } = useNotebookStore();
  const { getCurrentPhaseInfo } = useCycleStore();
  
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  
  const currentPhase = getCurrentPhaseInfo().phase || 'menstruelle';
  const prompts = PROMPTS_BY_PHASE[currentPhase] || PROMPTS_BY_PHASE.menstruelle;

  // Mise à jour suggestions tags en temps réel
  useEffect(() => {
    if (content.length > 10) {
      const suggestions = getSuggestedTags(content);
      setSuggestedTags(suggestions);
    } else {
      setSuggestedTags([]);
    }
  }, [content]);

  const handleSave = () => {
    if (content.trim().length === 0) return;
    
    addEntry(content, 'personal', { 
      phase: currentPhase,
      tags: selectedTags 
    });
    
    // Reset et fermer
    setContent('');
    setSelectedTags([]);
    setSuggestedTags([]);
    onClose();
  };

  const handlePromptSelect = (prompt) => {
    const newContent = content ? `${content}\n\n${prompt}` : prompt;
    setContent(newContent);
    setShowPrompts(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getPhaseEmoji = (phase) => {
    const emojis = {
      menstruelle: '🌙',
      folliculaire: '🌱', 
      ovulatoire: '☀️',
      lutéale: '🍂'
    };
    return emojis[phase] || '✨';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Heading2 style={styles.title}>
                  {getPhaseEmoji(currentPhase)} Mon Journal
                </Heading2>
                <Caption style={styles.phaseLabel}>Phase {currentPhase}</Caption>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => setShowPrompts(!showPrompts)}
                  style={styles.promptButton}
                >
                  <MaterialIcons name="lightbulb-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
                </TouchableOpacity>
              </View>
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
                <Caption style={styles.charCount}>
                  {content.length} caractères
                </Caption>
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
                      style={[
                        styles.tagPill,
                        selectedTags.includes(tag) && styles.tagPillSelected
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <BodyText style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected
                      ]}>
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
                        <MaterialIcons name="close" size={14} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
              >
                <BodyText style={styles.cancelButtonText}>Annuler</BodyText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  content.trim().length === 0 && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={content.trim().length === 0}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <BodyText style={styles.saveButtonText}>Sauvegarder</BodyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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