import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateStockFromMovements, needsRestock } from './stockCalculator'; // 👈 NOVO IMPORT

// Calcular estoque atual de um item
export const calculateCurrentStock = async (itemId) => {
  try {
    console.log('Calculando estoque para item:', itemId);
    
    // 👇 BUSCAR MOVIMENTAÇÕES DIRETAMENTE NO FIRESTORE (sem usar movementService)
    const q = query(
      collection(db, 'movements'), 
      where('itemId', '==', itemId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const movements = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movements.push({
        ...data,
        date: data.date 
          ? (data.date.toDate ? data.date.toDate() : new Date(data.date))
          : new Date()
      });
    });

    // 👇 USAR FUNÇÃO PURA PARA CALCULAR
    const stock = calculateStockFromMovements(movements);

    console.log('Estoque calculado:', stock, 'para item:', itemId);
    
    return { success: true, stock };
  } catch (error) {
    console.error("Erro ao calcular estoque:", error);
    return { success: false, error: "Erro ao calcular estoque." };
  }
};

// Atualizar estoque de um item
export const updateItemStock = async (itemId) => {
  try {
    const stockResult = await calculateCurrentStock(itemId);
    
    if (!stockResult.success) {
      return stockResult;
    }

    // Atualizar o campo currentStock no item
    const itemRef = doc(db, 'items', itemId);
    await updateDoc(itemRef, {
      currentStock: stockResult.stock,
      lastStockUpdate: new Date()
    });

    return { 
      success: true, 
      stock: stockResult.stock,
      message: "Estoque atualizado com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    return { success: false, error: "Erro ao atualizar estoque." };
  }
};

// Buscar todos os itens com estoque
export const getItemsWithStock = async () => {
  try {
    const q = query(
      collection(db, 'items'), 
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const items = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Calcular estoque atual para cada item
      const stockResult = await calculateCurrentStock(doc.id);
      const currentStock = stockResult.success ? stockResult.stock : 0;
      
      items.push({
        id: doc.id,
        ...data,
        currentStock: currentStock,
        createdAt: data.createdAt 
          ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
          : new Date(),
        needsRestock: needsRestock(currentStock, data.minStock || 0) // 👈 Alerta de estoque baixo (usa função que considera <= 1 unidade)
      });
    }
    
    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar itens com estoque:", error);
    return { success: false, error: "Erro ao carregar estoque." };
  }
};

// Buscar itens com estoque baixo
export const getLowStockItems = async () => {
  try {
    const itemsResult = await getItemsWithStock();
    
    if (!itemsResult.success) {
      return itemsResult;
    }

    const lowStockItems = itemsResult.data.filter(item => item.needsRestock);
    
    return { success: true, data: lowStockItems };
  } catch (error) {
    console.error("Erro ao buscar itens com estoque baixo:", error);
    return { success: false, error: "Erro ao carregar itens com estoque baixo." };
  }
};