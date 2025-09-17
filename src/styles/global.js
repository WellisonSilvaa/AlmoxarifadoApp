// src/styles/global.js
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  danger: '#e74c3c',
  dark: '#34495e',
  light: '#ecf0f1',
  white: '#ffffff',
  gray: '#95a5a6'
};

export const globalStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.light
  },

  // Títulos
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 20,
    textAlign: 'center'
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 15,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: colors.white
  },

  // Botões
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },

  // Textos
  text: {
    fontSize: 16,
    color: colors.dark,
    lineHeight: 24
  },

  textCenter: {
    textAlign: 'center'
  },

  textMuted: {
    color: colors.gray,
    fontSize: 14
  },

  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Espaçamentos
  mb10: {
    marginBottom: 10
  },

  mb20: {
    marginBottom: 20
  },

  mt10: {
    marginTop: 10
  },

  mt20: {
    marginTop: 20
  },

  p10: {
    padding: 10
  },

  p20: {
    padding: 20
  },

  // Estados
  disabled: {
    opacity: 0.6
  },

  // Ícones
  icon: {
    width: 24,
    height: 24,
    marginRight: 10
  }
});

// Exportar objeto de estilos para uso rápido
export default {
  colors,
  styles: globalStyles
};