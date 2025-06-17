// components/Typography/index.jsx
import { Text, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';

// H1 - Quintessential 24px
export function Heading1({ children, style, ...props }) {
  return (
    <Text style={[styles.heading1, style]} {...props}>
      {children}
    </Text>
  );
}

// H2 - Quintessential 20px  
export function Heading2({ children, style, ...props }) {
  return (
    <Text style={[styles.heading2, style]} {...props}>
      {children}
    </Text>
  );
}

// H3 - Quicksand Bold 16px
export function Heading3({ children, style, ...props }) {
  return (
    <Text style={[styles.heading3, style]} {...props}>
      {children}
    </Text>
  );
}

// Corps de texte - Quicksand Regular 14px
export function BodyText({ children, style, ...props }) {
  return (
    <Text style={[styles.body, style]} {...props}>
      {children}
    </Text>
  );
}

// Petit texte - Quicksand Regular 10px
export function SmallText({ children, style, ...props }) {
  return (
    <Text style={[styles.small, style]} {...props}>
      {children}
    </Text>
  );
}

// Alias pour compatibilité avec l'existant
export function Heading({ children, style, ...props }) {
  return <Heading1 style={style} {...props}>{children}</Heading1>;
}

export function Caption({ children, style, ...props }) {
  return <SmallText style={[styles.caption, style]} {...props}>{children}</SmallText>;
}

const styles = StyleSheet.create({
  heading1: {
    ...theme.typography.heading1,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  heading2: {
    ...theme.typography.heading2,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  heading3: {
    ...theme.typography.heading3,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  small: {
    ...theme.typography.small,
    color: theme.colors.text,
  },
  caption: {
    color: theme.colors.textLight, // Style spécial pour Caption
  },
});
