import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './firebase'
import { auth } from './firebase';

//import { calculateCurrentStock } from './stockService';
import { calculateStockFromMovements, needsRestock } from './stockCalculator';

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
      minStock: itemData.minStock || 0,
      currentStock: itemData.currentStock || 0,
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
    const q = query(
      collection(db, 'items'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const items = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // 👇 CALCULAR ESTOQUE DIRETAMENTE
      const movementsQuery = query(
        collection(db, 'movements'), 
        where('itemId', '==', doc.id),
        where('isActive', '==', true)
      );
      
      const movementsSnapshot = await getDocs(movementsQuery);
      let currentStock = 0;
      
      movementsSnapshot.forEach(movementDoc => {
        const movementData = movementDoc.data();
        if (movementData.type === 'entry') {
          currentStock += movementData.quantity;
        } else if (movementData.type === 'exit') {
          currentStock -= movementData.quantity;
        }
      });
      
      items.push({
        id: doc.id,
        ...data,
        currentStock: currentStock,
        needsRestock: needsRestock(currentStock, data.minStock || 0),
        createdAt: data.createdAt 
          ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
          : new Date()
      });
    }

    return { success: true, data: items };
  } catch (error) {
    console.error("Erro detalhado ao buscar itens:", error);
    return { success: false, error: "Erro ao carregar itens." };
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
    await updateDoc(itemRef, {
      isActive: false,
      deletedAt: new Date()
    });

    return { success: true, message: "Item desativado com sucesso!" };
  } catch (error) {
    console.error("Erro ao desativar item:", error);

    if (error.code === 'permission-denied') {
      return { success: false, error: "Permissão negada. Verifique as regras do Firestore." };
    }

    return { success: false, error: "Erro ao desativar item." };
  }
};


