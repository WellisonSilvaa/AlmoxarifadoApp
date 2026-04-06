// src/styles/global.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
  // Primary & Brand
  primary: '#b90014',     // Red Principal (Stitch)
  primaryVariant: '#e31b23', // Red Gradient End
  onPrimary: '#ffffff',
  
  // Secondary / Tertiary
  secondary: '#5f5e5e',
  tertiary: '#5a5b5b',
  
  // Neutral - Surface
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#edeeef',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainerHigh: '#e7e8e9',
  
  // Text Colors
  onSurface: '#191c1d',
  onSurfaceVariant: '#5d3f3c',
  onBackground: '#191c1d',
  
  // Status Colors
  error: '#ba1a1a',
  success: '#388E3C',
  warning: '#F57C00',
  
  // States/Fills
  outline: '#926e6b',
  outlineVariant: '#e7bdb8',
  
  // Legacy support/Helpers
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  dark: '#191c1d',
  light: '#f8f9fa',
  danger: '#ba1a1a',
};

export const typography = {
  headline: {
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -1,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'Inter_400Regular',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
};

export const globalStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  // Títulos
  title: {
    ...typography.title,
    fontSize: 26,
    color: colors.onSurface,
    marginBottom: 20,
  },

  // Inputs
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderRadius: 14,
    marginBottom: 16,
    color: colors.onSurface,
  },

  // Botões
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },

  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // Textos
  text: {
    ...typography.body,
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 24,
  },

  textCenter: {
    textAlign: 'center'
  },

  textMuted: {
    ...typography.body,
    color: colors.secondary,
    fontSize: 14,
  },

  // Bento Grid / Layout Helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)', // Solo funciona en Web/Some Native modules
  },

  velocityGradient: {
    // Para ser usado com linear-gradient
    colors: [colors.primary, colors.primaryVariant],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  }
});

export default {
  colors,
  typography,
  styles: globalStyles
};