import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';
//import { updateItemStock } from './stockService';

const updateStockAfterMovement = async (itemId) => {
  try {
    console.log('Atualizando estoque do item:', itemId);
    
    // Buscar todas as movimentações do item
    const q = query(
      collection(db, 'movements'), 
      where('itemId', '==', itemId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    let stock = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.type === 'entry') {
        stock += data.quantity;
      } else if (data.type === 'exit') {
        stock -= data.quantity;
      }
    });

    // Atualizar o campo currentStock no item
    const itemRef = doc(db, 'items', itemId);
    await updateDoc(itemRef, {
      currentStock: stock,
      lastStockUpdate: new Date()
    });

    console.log('Estoque atualizado para:', stock);
    return { success: true, stock };
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    return { success: false, error: "Erro ao atualizar estoque." };
  }
};

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

    // 👇 VALIDAÇÃO CRÍTICA: VERIFICAR ESTOQUE PARA SAÍDAS
    if (movementData.type === 'exit') {
      console.log('🔍 Validando estoque para saída...');
      
      // Buscar estoque atual do item
      const stockQuery = query(
        collection(db, 'movements'), 
        where('itemId', '==', movementData.itemId),
        where('isActive', '==', true)
      );
      
      const movementsSnapshot = await getDocs(stockQuery);
      let currentStock = 0;
      
      // Calcular estoque atual
      movementsSnapshot.forEach(doc => {
        const movement = doc.data();
        if (movement.type === 'entry') {
          currentStock += movement.quantity;
        } else if (movement.type === 'exit') {
          currentStock -= movement.quantity;
        }
      });
      
      console.log('📊 Estoque atual:', currentStock, 'Quantidade solicitada:', movementData.quantity);
      
      // Verificar se há estoque suficiente
      if (currentStock < movementData.quantity) {
        const falta = movementData.quantity - currentStock;
        return { 
          success: false, 
          error: `Estoque insuficiente! Disponível: ${currentStock} unidades. Faltam: ${falta} unidades.` 
        };
      }
      
      console.log('✅ Estoque validado - Saída permitida');
    }

    // 👇 CRIAR MOVIMENTAÇÃO (se passou na validação)
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

    // 👇 ATUALIZAR ESTOQUE APÓS MOVIMENTAÇÃO
    console.log('Atualizando estoque do item:', movementData.itemId);
    const stockResult = await updateStockAfterMovement(movementData.itemId);
    
    if (!stockResult.success) {
      console.warn('Aviso: Movimentação criada, mas estoque não foi atualizado:', stockResult.error);
    }

    return { 
      success: true, 
      id: docRef.id, 
      message: `Movimentação de ${movementData.type === 'entry' ? 'entrada' : 'saída'} registrada com sucesso!${stockResult.success ? ' Estoque atualizado.' : ' (Aviso: estoque não atualizado)'}` 
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

// Buscar movimentação por ID
export const getMovementById = async (id) => {
  try {
    console.log('Buscando movimentação por ID:', id);

    const movementRef = doc(db, 'movements', id);
    const docSnap = await getDoc(movementRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Movimentação encontrada:', data);

      return {
        success: true,
        data: {
          id: docSnap.id,
          ...data,
          date: data.date
            ? (data.date.toDate ? data.date.toDate() : new Date(data.date))
            : new Date()
        }
      };
    } else {
      console.log('Movimentação não encontrada');
      return { success: false, error: "Movimentação não encontrada" };
    }
  } catch (error) {
    console.error("Erro ao buscar movimentação:", error);
    return { success: false, error: "Erro ao carregar movimentação." };
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