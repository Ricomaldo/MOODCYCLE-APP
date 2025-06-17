// components/MeluneAvatar/index.jsx
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';

export default function MeluneAvatar({ phase = 'menstrual', size = 'large', style = 'classic' }) {
  // Pour le MVP, on utilise une seule image
  const getSource = () => {
    try {
      return require('../../assets/images/melune/default.png');
    } catch (error) {
      console.log('Erreur chargement image Melune:', error);
      return null;
    }
  };
  
  const sizeValue = size === 'large' ? 160 : size === 'medium' ? 120 : 80;
  const borderColor = theme.colors.phases?.[phase] || theme.colors.primary;
  
  return (
    <View style={[
      styles.container, 
      { 
        borderColor: borderColor,
        width: sizeValue + 12, // Pour le bord
        height: sizeValue + 12
      }
    ]}>
      <Image 
        source={getSource()} 
        style={{ width: sizeValue, height: sizeValue }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 9999, // Cercle parfait
    padding: 4,
    overflow: 'hidden',
  },
});
