import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
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

export const getItems = async () => {
  try {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const items = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Dados brutos do documento:', data);

      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? (data.createdAt.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt))
          : new Date() // Fallback
      });
    });

    return { success: true, data: items };

  } catch (error) {
    console.error("Erro detalhado ao buscar itens:", error);
    console.error("Código do erro:", error.code);
    console.error("Mensagem do erro:", error.message);
    return { success: false, error: "Erro ao carregar items" };
  }
};

// Buscar item por ID
export const getItemById = async (id) => {
  try {
    const itemRef = doc(db, 'items', id);
    const docSnap = await getDoc(itemRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt
            ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
            : new Date()
        }
      };
    } else {
      return { success: false, error: "Item não encontrado" };
    }
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return { success: false, error: "Erro ao carregar item." };
  }
};

// Atualizar item
export const updateItem = async (id, itemData) => {
  try {
    console.log('Atualizando item', id, itemData);

    const itemRef = doc(db, 'items', id);

    const updateData = {
      name: itemData.name.trim(),
      description: itemData.description?.trim() || '',
      photoUrl: itemData.photoUrl || '',
      isActive: itemData.isActive !== undefined ? itemData.isActive : true,
      updatedAt: new Date() // 👈 Adicionar campo de atualização
    };

    await updateDoc(itemRef, updateData);

    return {
      success: true,
      message: "Item atualizado com sucesso!"
    };
  } catch (error) {
    console.error("Erro ao atualizar item:", error);

   if (error.code === 'permission-denied') {
      return { success: false, error: "Permissão negada. Verifique as regras do Firestore." };
    }
    
    return { success: false, error: "Erro ao atualizar item." };
  }
};

// Deletar item (desativar)
export const deleteItem = async (id) => {
  try {
    const itemRef = doc(db, 'items', id);
    await updateDoc(itemRef, { isActive: false });

    return { success: true, message: "Item desativado com sucesso!" };
  } catch (error) {
    console.error("Erro ao desativar item:", error);
    return { success: false, error: "Erro ao desativar item." };
  }
};


