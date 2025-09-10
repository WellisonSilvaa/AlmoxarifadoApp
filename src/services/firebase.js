// src/services/firebase.js
// Importação para Firebase v12 com persistência
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Sua configuração do Firebase (substitua com seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyBkzLd38OWJIUBCYn7JUoVJJQ2aGQ5BOA0",
  authDomain: "almoxarifado-app-9d831.firebaseapp.com",
  projectId: "almoxarifado-app-9d831",
  storageBucket: "almoxarifado-app-9d831.firebasestorage.app",
  messagingSenderId: "753285937415",
  appId: "1:753285937415:web:5aa7802006c299498deda2"
};
// console.log para debug
console.log('Firebase config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? 'CONFIGURADA' : 'FALTANDO'
});

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// Debug: verificar se storage foi inicializado
console.log('Storage inicializado:', storage ? 'SIM' : 'NÃO');

export default app;