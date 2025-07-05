import React from 'react';
import { useAppStore } from '../stores/useAppStore';

export function AppStoreProvider({ children }) {
  // Initialiser le store avec les valeurs par défaut si nécessaire
  const store = useAppStore();
  
  // Si le store n'est pas encore hydraté, on peut montrer un loader
  if (!store) {
    return null; // ou un composant de chargement
  }

  return children;
} 