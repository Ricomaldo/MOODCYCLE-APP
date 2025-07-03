//
// ─────────────────────────────────────────────────────────
// 📄 File: src/core/ui/typography/components.js
// 🧩 Type: Typography React Components
// 📚 Description: Composants Typography React Native
// 🕒 Version: 9.0 - 2025-06-21 - OPTION A MIGRATION
// 🧭 Used in: Toute l'application
// ─────────────────────────────────────────────────────────
//

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FONTS, TYPOGRAPHY_SCALE } from '../../../config/theme/typography';

// ═══════════════════════════════════════════════════════
// 🎨 FONTS MAPPING POUR COMPATIBILITÉ
// ═══════════════════════════════════════════════════════

const FONTS_MAPPED = {
  primary: {
    bold: FONTS.heading,
    semiBold: FONTS.bodyBold,
    regular: FONTS.body,
  }
};

// ═══════════════════════════════════════════════════════
// 📝 TYPOGRAPHY COMPONENTS
// ═══════════════════════════════════════════════════════

// H1 - Quintessential 24px
export function Heading1({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <Text style={[styles.heading1, style]} {...props}>
      {children}
    </Text>
  );
}

// H2 - Quintessential 20px
export function Heading2({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <Text style={[styles.heading2, style]} {...props}>
      {children}
    </Text>
  );
}

// H3 - Quicksand Bold 16px
export function Heading3({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <Text style={[styles.heading3, style]} {...props}>
      {children}
    </Text>
  );
}

// Corps de texte - Quicksand Regular 14px
export function BodyText({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <Text style={[styles.body, style]} {...props}>
      {children}
    </Text>
  );
}

// Petit texte - Quicksand Regular 10px
export function SmallText({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <Text style={[styles.small, style]} {...props}>
      {children}
    </Text>
  );
}

// ═══════════════════════════════════════════════════════
// 📝 ALIASES POUR COMPATIBILITÉ
// ═══════════════════════════════════════════════════════

// Alias pour compatibilité avec l'existant
export function Heading({ children, style, ...props }) {
  return (
    <Heading1 style={style} {...props}>
      {children}
    </Heading1>
  );
}

export function Caption({ children, style, ...props }) {
  const styles = getStyles();
  
  return (
    <SmallText style={[styles.caption, style]} {...props}>
      {children}
    </SmallText>
  );
}

// ═══════════════════════════════════════════════════════
// 🎨 STYLES GENERATION
// ═══════════════════════════════════════════════════════

const getStyles = () => StyleSheet.create({
  heading1: {
    fontFamily: FONTS_MAPPED.primary.bold,
    fontSize: TYPOGRAPHY_SCALE.heading1.fontSize,
    lineHeight: TYPOGRAPHY_SCALE.heading1.fontSize * 1.2,
    letterSpacing: 0.25,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  heading2: {
    fontFamily: FONTS_MAPPED.primary.bold,
    fontSize: TYPOGRAPHY_SCALE.heading2.fontSize,
    lineHeight: TYPOGRAPHY_SCALE.heading2.fontSize * 1.3,
    letterSpacing: 0.15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  heading3: {
    fontFamily: FONTS_MAPPED.primary.semiBold,
    fontSize: TYPOGRAPHY_SCALE.heading3.fontSize,
    lineHeight: TYPOGRAPHY_SCALE.heading3.fontSize * 1.4,
    letterSpacing: 0.1,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  body: {
    fontFamily: FONTS_MAPPED.primary.regular,
    fontSize: TYPOGRAPHY_SCALE.body.fontSize,
    lineHeight: TYPOGRAPHY_SCALE.body.fontSize * 1.5,
    letterSpacing: 0,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  small: {
    fontFamily: FONTS_MAPPED.primary.regular,
    fontSize: TYPOGRAPHY_SCALE.small.fontSize,
    lineHeight: TYPOGRAPHY_SCALE.small.fontSize * 1.4,
    letterSpacing: 0.4,
    fontWeight: '400',
    color: '#1A1A1A',
  },
  caption: {
    color: '#666666', // Style spécial pour Caption
  },
}); 