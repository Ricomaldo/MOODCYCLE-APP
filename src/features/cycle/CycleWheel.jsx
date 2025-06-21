//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/cycle/CycleWheel.jsx
// 🧩 Type : Composant Vue Cycle
// 📚 Description : Roue graphique représentant les phases du cycle
// 🕒 Version : 3.0 - 2025-06-21
// 🧭 Utilisé dans : CycleView, NotebookView
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, Path, G, Line, Text } from 'react-native-svg';
import { theme } from '../../config/theme';
import { CYCLE_DEFAULTS, PHASE_NAMES, WHEEL_CONSTANTS } from '../../config/cycleConstants';

export default function CycleWheel({
  currentPhase = PHASE_NAMES.MENSTRUAL,
  size = 250,
  userName = 'Emma',
  cycleDay = 8,
  cycleLength = CYCLE_DEFAULTS.LENGTH,
  onPhasePress = () => {},
}) {
  // Configuration des phases du cycle depuis les constantes
  const phases = Object.values(PHASE_NAMES);
  const colors = phases.map((phase) => theme.colors.phases[phase]);

  // 🎯 Limite prénom selon constante
  const displayName = userName.length > WHEEL_CONSTANTS.MAX_NAME_LENGTH 
    ? userName.substring(0, WHEEL_CONSTANTS.MAX_NAME_LENGTH) + '...' 
    : userName;

  // Calculs de base pour le cercle
  const radius = size / 2;
  const strokeWidth = WHEEL_CONSTANTS.STROKE_WIDTH;
  const innerRadius = radius - strokeWidth;

  // Configuration du dégradé depuis les constantes
  const arcsPerQuart = WHEEL_CONSTANTS.ARCS_PER_QUARTER;
  const degreesPerArc = 90 / arcsPerQuart;
  const totalArcs = phases.length * arcsPerQuart;

  // Extension pour les lignes de séparation
  const separatorExtension = WHEEL_CONSTANTS.SEPARATOR_EXTENSION;
  const adjustedSize = size + 2 * separatorExtension;
  const adjustedCenterX = radius + separatorExtension;
  const adjustedCenterY = radius + separatorExtension;

  // Angle de rotation pour maintenir la position actuelle en haut
  const rotationAngle = -(((cycleDay - 0.5) / cycleLength) * 360);

  // Fonction d'interpolation de couleur entre deux couleurs hex
  const interpolateColor = (color1, color2, factor) => {
    const c1 = color1.match(/\w\w/g).map((x) => parseInt(x, 16));
    const c2 = color2.match(/\w\w/g).map((x) => parseInt(x, 16));
    const result = c1.map((v, i) => Math.round(v + (c2[i] - v) * factor));
    return '#' + result.map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  // Calcule la couleur d'un arc avec dégradé centré sur chaque phase
  const getArcColor = (arcIndex) => {
    const globalPosition = arcIndex / totalArcs;
    const phasePosition = globalPosition * phases.length;
    const segment = Math.floor(phasePosition);
    const positionInSegment = phasePosition - segment;

    const currentPhaseIndex = segment % phases.length;
    const nextPhaseIndex = (segment + 1) % phases.length;

    if (positionInSegment <= 0.5) {
      // Première moitié : dégradé de la frontière précédente vers le centre
      const prevPhaseIndex = (currentPhaseIndex - 1 + phases.length) % phases.length;
      const factor = positionInSegment * 2;
      return interpolateColor(
        interpolateColor(colors[prevPhaseIndex], colors[currentPhaseIndex], 0.5),
        colors[currentPhaseIndex],
        factor
      );
    } else {
      // Deuxième moitié : dégradé du centre vers la frontière suivante
      const factor = (positionInSegment - 0.5) * 2;
      return interpolateColor(
        colors[currentPhaseIndex],
        interpolateColor(colors[currentPhaseIndex], colors[nextPhaseIndex], 0.5),
        factor
      );
    }
  };

  // Crée un arc SVG avec rotation appliquée
  const createArc = (startAngle, endAngle, color, phaseIndex) => {
    const rotatedStartAngle = startAngle + rotationAngle;
    const rotatedEndAngle = endAngle + rotationAngle;

    const startAngleRad = ((rotatedStartAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((rotatedEndAngle - 90) * Math.PI) / 180;

    const x1 = adjustedCenterX + innerRadius * Math.cos(startAngleRad);
    const y1 = adjustedCenterY + innerRadius * Math.sin(startAngleRad);
    const x2 = adjustedCenterX + innerRadius * Math.cos(endAngleRad);
    const y2 = adjustedCenterY + innerRadius * Math.sin(endAngleRad);

    const x3 = adjustedCenterX + radius * Math.cos(endAngleRad);
    const y3 = adjustedCenterY + radius * Math.sin(endAngleRad);
    const x4 = adjustedCenterX + radius * Math.cos(startAngleRad);
    const y4 = adjustedCenterY + radius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      `Z`,
    ].join(' ');

    const currentPhaseId = phases[Math.floor(phaseIndex / arcsPerQuart)];

    return (
      <Path
        key={`arc-${startAngle}-${endAngle}`}
        d={pathData}
        fill={color}
        onPress={() => onPhasePress(currentPhaseId)}
      />
    );
  };

  // Génération des arcs de la roue
  const arcs = [];
  for (let i = 0; i < totalArcs; i++) {
    const startAngle = i * degreesPerArc;
    const endAngle = (i + 1) * degreesPerArc;
    const color = getArcColor(i);
    arcs.push(createArc(startAngle, endAngle, color, i));
  }

  // Génération des lignes de séparation pointillées entre les phases
  const separatorLines = [];
  for (let i = 0; i < phases.length; i++) {
    const angle = i * 90 + rotationAngle;
    const angleRad = ((angle - 90) * Math.PI) / 180;

    const innerPoint = {
      x: adjustedCenterX + (innerRadius - separatorExtension) * Math.cos(angleRad),
      y: adjustedCenterY + (innerRadius - separatorExtension) * Math.sin(angleRad),
    };

    const outerPoint = {
      x: adjustedCenterX + (radius + separatorExtension) * Math.cos(angleRad),
      y: adjustedCenterY + (radius + separatorExtension) * Math.sin(angleRad),
    };

    separatorLines.push(
      <Line
        key={`separator-${angle}`}
        x1={innerPoint.x}
        y1={innerPoint.y}
        x2={outerPoint.x}
        y2={outerPoint.y}
        stroke="#000000"
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.4"
      />
    );
  }

  // Position du marqueur fixe en haut
  const markerX = adjustedCenterX;
  const markerY = adjustedCenterY - (radius - strokeWidth / 2);

  return (
    <View style={styles.container}>
      <Svg
        width={adjustedSize}
        height={adjustedSize}
        viewBox={`0 0 ${adjustedSize} ${adjustedSize}`}
      >
        <G>
          {arcs}
          {separatorLines}
        </G>

        {/* Cercle central avec couleur de background */}
        <Circle
          cx={adjustedCenterX}
          cy={adjustedCenterY}
          r={strokeWidth}
          fill={theme.colors.background}
        />

        {/* Prénom coloré selon la phase actuelle (max 12 chars) */}
        <Text
          x={adjustedCenterX}
          y={adjustedCenterY}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={size > WHEEL_CONSTANTS.SIZE_THRESHOLD ? WHEEL_CONSTANTS.FONT_SIZE.LARGE : WHEEL_CONSTANTS.FONT_SIZE.SMALL}
          fontWeight="bold"
          fill={theme.colors.phases[currentPhase]}
        >
          {displayName}
        </Text>

        {/* Marqueur de position fixe en haut */}
        <Circle cx={markerX} cy={markerY} r={WHEEL_CONSTANTS.MARKER_RADIUS} fill="white" stroke="#333" strokeWidth={2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.m,
  },
});
