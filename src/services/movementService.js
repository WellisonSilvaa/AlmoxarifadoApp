import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// Criar nova movimentação
export const createMovement = async (movementData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validações básicas
    if (!movementData.type || !movementData.itemId || !movementData.itemName) {
      return { success: false, error: "Tipo, item e nome são obrigatórios" };
    }

    if (!movementData.quantity || movementData.quantity <= 0) {
      return { success: false, error: "Quantidade deve ser maior que zero" };
    }

    if (!movementData.responsible) {
      return { success: false, error: "Responsável é obrigatório" };
    }

    // Para saídas, validar carreta
    if (movementData.type === 'exit' && !movementData.truckId) {
      return { success: false, error: "Para saída, a carreta é obrigatória" };
    }

    const docRef = await addDoc(collection(db, 'movements'), {
      type: movementData.type,
      itemId: movementData.itemId,
      itemName: movementData.itemName,
      quantity: movementData.quantity,
      truckId: movementData.truckId || '',
      truckPlate: movementData.truckPlate || '',
      responsible: movementData.responsible.trim(),
      photoUrl: movementData.photoUrl || '',
      notes: movementData.notes?.trim() || '',
      date: new Date(),
      createdBy: user.uid,
      isActive: true
    });

    return { 
      success: true, 
      id: docRef.id, 
      message: `Movimentação de ${movementData.type === 'entry' ? 'entrada' : 'saída'} registrada com sucesso!` 
    };
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return { success: false, error: "Erro ao registrar movimentação." };
  }
};

// Buscar todas as movimentações
export const getMovements = async () => {
  try {
    const q = query(
      collection(db, 'movements'), 
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const movements = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movements.push({
        id: doc.id,
        ...data,
        date: data.date 
          ? (data.date.toDate ? data.date.toDate() : new Date(data.date))
          : new Date()
      });
    });
    
    return { success: true, data: movements };
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return { success: false, error: "Erro ao carregar movimentações." };
  }
};

// Buscar movimentações por item
export const getMovementsByItem = async (itemId) => {
  try {
    const q = query(
      collection(db, 'movements'), 
      where('itemId', '==', itemId),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const movements = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movements.push({
        id: doc.id,
        ...data,
        date: data.date 
          ? (data.date.toDate ? data.date.toDate() : new Date(data.date))
          : new Date()
      });
    });
    
    return { success: true, data: movements };
  } catch (error) {
    console.error("Erro ao buscar movimentações do item:", error);
    return { success: false, error: "Erro ao carregar histórico do item." };
  }
};