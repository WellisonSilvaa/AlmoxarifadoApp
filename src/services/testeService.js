// src/services/testService.js
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const testFirestoreConnection = async () => {
  try {
    // Tentar adicionar um documento de teste
    const docRef = await addDoc(collection(db, 'connection_test'), {
      test: true,
      timestamp: new Date(),
      message: 'Teste de conexão com Firestore'
    });
    
    console.log('Documento escrito com ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao testar Firestore:', error);
    return { success: false, error: error.message };
  }
};

export const checkCollections = async () => {
  try {
    const collections = await getDocs(collection(db, 'employees'));
    console.log('Collections encontradas:', collections.size);
    return { success: true, count: collections.size };
  } catch (error) {
    console.error('Erro ao verificar collections:', error);
    return { success: false, error: error.message };
  }
};