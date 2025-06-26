//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : __tests__/__mocks__/expoLinearGradient.js
// 🧩 Type : Mock Jest
// 📚 Description : Mock pour expo-linear-gradient
// 🕒 Version : 1.0 - 2025-06-26
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//

import React from 'react';
import { View } from 'react-native';

export const LinearGradient = React.forwardRef((props, ref) => (
  <View 
    ref={ref}
    style={[
      props.style,
      { backgroundColor: props.colors?.[0] || '#8B5CF6' }
    ]}
  >
    {props.children}
  </View>
)); 