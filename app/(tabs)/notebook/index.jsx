import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotebookScreen from '../../../components/Notebook/NotebookScreen';

export default function NotebookRoute() {
  const insets = useSafeAreaInsets();
  
  return <NotebookScreen insets={insets} />;
}

