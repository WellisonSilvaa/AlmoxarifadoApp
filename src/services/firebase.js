// src/services/firebase.js
// Importação para Firebase v12 com persistência
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Nunca exponha credenciais no código-fonte!
// Use variáveis de ambiente em um arquivo .env (ignorado pelo git)
// Exemplo: REACT_APP_FIREBASE_API_KEY=sua_chave_aqui
// Para desenvolvimento local, use um arquivo .env.local

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// console.log para debug (sem expor chaves sensíveis)
console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
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