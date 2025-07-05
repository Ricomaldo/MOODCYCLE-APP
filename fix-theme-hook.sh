#!/bin/bash

# Liste des fichiers à modifier (exclus les fichiers .md)
files=$(find . -type f \( -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.git/*")

for file in $files; do
  # Remplace la déstructuration incorrecte par l'utilisation correcte
  sed -i '' 's/const { theme } = useTheme()/const theme = useTheme()/g' "$file"
done

echo "✅ Correction du hook useTheme terminée" 