//
// ─────────────────────────────────────────────────────────
// 📄 Fichier : src/features/cycle/CycleWheel.jsx
// 🧩 Type : Composant Vue Cycle
// 📚 Description : Roue graphique représentant les phases du cycle
// 🕒 Version : 3.1 - 2025-06-23 - Enrichie avec émojis + légende
// 🧭 Utilisé dans : CycleView, NotebookView
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle, Path, G, Line, Text } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { CYCLE_DEFAULTS, PHASE_NAMES, WHEEL_CONSTANTS, THERAPEUTIC_WHEEL } from '../../config/cycleConstants';
import { getPhaseSymbol, getPhaseMetadata } from '../../utils/formatters';

export default function CycleWheel({
  currentPhase = PHASE_NAMES.MENSTRUAL,
  size = 250,
  userName = 'Emma',
  cycleDay = 8,
  cycleLength = CYCLE_DEFAULTS.LENGTH,
  onPhasePress = () => {},
}) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
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
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeDasharray="0"
        opacity={WHEEL_CONSTANTS.SEPARATOR_OPACITY}
      />
    );
  }

  // 🔮 Génération des axes cardinaux (style thérapeutique)
  const cardinalAxes = [];
  if (THERAPEUTIC_WHEEL.CARDINAL_AXES) {
    for (let i = 0; i < 4; i++) {
      const angle = i * 90 + rotationAngle;
      const angleRad = ((angle - 90) * Math.PI) / 180;

      const innerPoint = {
        x: adjustedCenterX + (innerRadius - separatorExtension * 2) * Math.cos(angleRad),
        y: adjustedCenterY + (innerRadius - separatorExtension * 2) * Math.sin(angleRad),
      };

      const outerPoint = {
        x: adjustedCenterX + (radius + separatorExtension * 2) * Math.cos(angleRad),
        y: adjustedCenterY + (radius + separatorExtension * 2) * Math.sin(angleRad),
      };

      cardinalAxes.push(
        <Line
          key={`cardinal-${angle}`}
          x1={innerPoint.x}
          y1={innerPoint.y}
          x2={outerPoint.x}
          y2={outerPoint.y}
          stroke={THERAPEUTIC_WHEEL.AXIS_COLOR}
          strokeWidth={THERAPEUTIC_WHEEL.AXIS_STROKE_WIDTH}
          opacity={THERAPEUTIC_WHEEL.AXIS_OPACITY}
        />
      );
    }
  }

  // 🔮 Génération des descriptions énergétiques en texte courbe
  const phaseDescriptions = [];
  if (THERAPEUTIC_WHEEL.CURVED_TEXT.ENABLED) {
    phases.forEach((phase, index) => {
      const description = THERAPEUTIC_WHEEL.PHASE_DESCRIPTIONS[phase];
      if (description) {
        const angle = index * 90 + 45 + rotationAngle; // Centre de chaque phase
        const textRadius = radius + THERAPEUTIC_WHEEL.CURVED_TEXT.RADIUS_OFFSET;
        const angleRad = ((angle - 90) * Math.PI) / 180;
        const x = adjustedCenterX + textRadius * Math.cos(angleRad);
        const y = adjustedCenterY + textRadius * Math.sin(angleRad);

        phaseDescriptions.push(
          <Text
            key={`desc-${phase}`}
            x={x}
            y={y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={THERAPEUTIC_WHEEL.CURVED_TEXT.FONT_SIZE}
            fill={theme.colors.textLight}
            fontWeight="500"
            opacity={0.8}
            letterSpacing={THERAPEUTIC_WHEEL.CURVED_TEXT.LETTER_SPACING}
            transform={`rotate(${angle}, ${x}, ${y})`}
          >
            {description}
          </Text>
        );
      }
    });
  }

  // Position du marqueur fixe en haut
  const markerX = adjustedCenterX;
  const markerY = adjustedCenterY - (radius - strokeWidth / 2);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={adjustedSize} height={adjustedSize}>
        <G>
          {arcs}
          {separatorLines}
          {/* 🔮 Axes cardinaux thérapeutiques */}
          {cardinalAxes}
        </G>

        {/* 🔮 Descriptions énergétiques courbes */}
        {phaseDescriptions}

        {/* Cercle central avec décoration mandala */}
        <Circle
          cx={adjustedCenterX}
          cy={adjustedCenterY}
          r={strokeWidth}
          fill={theme.colors.background}
          stroke={theme.colors.border}
          strokeWidth={1}
          opacity={0.9}
        />

        {/* 🔮 Cercle intérieur décoratif */}
        {THERAPEUTIC_WHEEL.MANDALA_STYLE.INNER_CIRCLE_DECORATION && (
          <Circle
            cx={adjustedCenterX}
            cy={adjustedCenterY}
            r={strokeWidth - THERAPEUTIC_WHEEL.MANDALA_STYLE.INNER_CIRCLE_RADIUS}
            fill="none"
            stroke={theme.colors.phases[currentPhase]}
            strokeWidth={2}
            opacity={0.3}
            strokeDasharray="4,4"
          />
        )}

        {/* Prénom avec police heading (style thérapeutique) */}
        <Text
          x={adjustedCenterX}
          y={adjustedCenterY}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={size > WHEEL_CONSTANTS.SIZE_THRESHOLD ? WHEEL_CONSTANTS.FONT_SIZE.LARGE : WHEEL_CONSTANTS.FONT_SIZE.SMALL}
          fontFamily={theme.fonts.heading}
          fontWeight="normal"
          fill={theme.colors.phases[currentPhase]}
        >
          {displayName}
        </Text>

        {/* Marqueur de position fixe en haut */}
        <Circle cx={markerX} cy={markerY} r={WHEEL_CONSTANTS.MARKER_RADIUS} fill="white" stroke="#333" strokeWidth={2} />
      </Svg>

      {/* 🏷️ Légende des phases - Conditionnelle */}
      {WHEEL_CONSTANTS.SHOW_LEGEND && (
        <View style={styles.legend}>
          {phases.map((phase, index) => (
            <Pressable 
              key={phase} 
              style={styles.legendItem}
              onPress={() => onPhasePress(phase)}
            >
              <View style={[styles.legendDot, { backgroundColor: colors[index] }]} />
              <Text style={styles.legendText}>
                {getPhaseSymbol(phase)} {getPhaseMetadata(phase)?.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.m,
  },
  // 🏷️ Styles pour la légende
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs / 2,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
});