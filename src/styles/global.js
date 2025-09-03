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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.light
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 15,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: colors.white
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  }
});