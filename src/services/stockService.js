
// src/services/stockService.js
import { getItems } from './itemService';

/**
 * SERVIÇO DE ESTOQUE (Supabase)
 * 
 * Centraliza a lógica de estoque utilizando o itemService.
 * Os cálculos de estoque são feitos agora diretamente via agregação de movimentações no Supabase.
 */

// Buscar todos os itens com estoque calculado
export const getItemsWithStock = async () => {
  try {
    return await getItems();
  } catch (error) {
    console.error("Erro ao transcrever getItemsWithStock:", error);
    return { success: false, error: "Erro ao carregar dados de estoque." };
  }
};

// Buscar especificamente itens com estoque baixo
export const getLowStockItems = async () => {
  try {
    const result = await getItems();
    if (!result.success) return result;

    const lowStock = result.data.filter(item => item.needsRestock);
    return { success: true, data: lowStock };
  } catch (error) {
    return { success: false, error: "Erro ao filtrar estoque baixo." };
  }
};

// Mock para retrocompatibilidade (o Supabase já faz o cálculo em tempo real no getItems)
export const calculateCurrentStock = async (itemId) => {
    const result = await getItems();
    if (!result.success) return result;
    const item = result.data.find(i => i.id === itemId);
    return { success: true, stock: item?.currentStock || 0 };
};

export const updateItemStock = async (itemId) => {
    // No Supabase, o estoque é derivado das movimentações,
    // então não precisamos "atualizar" um campo estático como no Firebase.
    return { success: true, message: "Estoque sincronizado em tempo real." };
};