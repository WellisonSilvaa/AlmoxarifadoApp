// src/services/firebase.js
// Importação para Firebase v12 com persistência
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Authentication com persistência
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicializar Firestore
export const db = getFirestore(app);

export default app;