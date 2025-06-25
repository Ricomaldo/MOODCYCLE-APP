// Mock pour @expo/vector-icons
const Feather = ({ name, size, color, ...props }) => {
    return null; // Rendu vide pour les tests
  };
  
  const AntDesign = ({ name, size, color, ...props }) => {
    return null;
  };
  
  const MaterialIcons = ({ name, size, color, ...props }) => {
    return null;
  };
  
  const Ionicons = ({ name, size, color, ...props }) => {
    return null;
  };
  
  // Export tous les icônes comme des composants vides
  module.exports = {
    Feather,
    AntDesign,
    MaterialIcons,
    Ionicons,
    // Ajoutez d'autres icônes si nécessaire
  };