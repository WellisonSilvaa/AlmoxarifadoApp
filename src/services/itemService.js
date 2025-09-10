import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase'
import { auth } from './firebase';

// Criar novo item 
export const createItem = async (itemData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Ajustar limite para base64 (1MB = 1.000.000 bytes)
    if (itemData.photoUrl && itemData.photoUrl.length > 1000000) {
      return { 
        success: false, 
        error: "Imagem muito grande. Tente uma imagem menor." 
      };
    }

    const docRef = await addDoc(collection(db, 'items'), {
      name: itemData.name.trim(),
      description: itemData.description?.trim() || '',
      photoUrl: itemData.photoUrl || '',
      createdAt: new Date(),
      createdBy: user.uid,
      isActive: true
    });

    return { 
      success: true, 
      id: docRef.id, 
      message: "Item cadastrado com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar item:", error);
    
    // Mensagem mais específica sobre permissões
    if (error.code === 'permission-denied') {
      return { success: false, error: "Permissão negada. Verifique as regras do Firestore." };
    }
    
    return { success: false, error: "Erro ao cadastrar item." };
  }
};

//Buscar todos os itens

export const getItem = async () => {
    try {
        const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = [];

        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });

        return { succes: true, data: items};

    } catch (error) {
        console.error("Erro ao buscar items", error);
        return { succes: false, error: "Erro ao carregar items"};
    }
};


