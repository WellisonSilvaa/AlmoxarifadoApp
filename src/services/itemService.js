
// src/services/itemService.js
import { supabase } from './supabase';

const TABLE_NAME = 'items';

// Criar novo item
export const createItem = async (itemData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        name: itemData.name.trim(),
        description: itemData.description?.trim() || '',
        photo_url: itemData.photoUrl || '',
        min_stock: itemData.minStock || 0,
        current_stock: itemData.currentStock || 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: data.id, message: "Item cadastrado com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return { success: false, error: "Erro ao cadastrar item." };
  }
};

// Obter todos os itens (Otimizado)
export const getItems = async () => {
  try {
    console.log('--- Iniciando busca Supabase de itens ---');
    const start = Date.now();

    // 1. Buscar itens (is_active: true)
    const { data: items, error: itemsError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (itemsError) throw itemsError;

    // 2. Buscar movimentações para calcular estoque real
    const { data: movements, error: movementsError } = await supabase
      .from('movements')
      .select('item_id, type, quantity');

    if (movementsError) throw movementsError;

    // 3. Mapear movimentações
    const movementsMap = {};
    movements.forEach(m => {
      if (!movementsMap[m.item_id]) movementsMap[m.item_id] = 0;
      if (m.type === 'entry') movementsMap[m.item_id] += m.quantity;
      else if (m.type === 'exit') movementsMap[m.item_id] -= m.quantity;
    });

    // 4. Processar itens
    const processedItems = items.map(item => {
      const calculatedStock = movementsMap[item.id] || 0;
      return {
        ...item,
        isActive: item.is_active,     // Mapeamento crucial
        photoUrl: item.photo_url,     // Compatibilidade com frontend
        currentStock: calculatedStock,
        minStock: item.min_stock,
        needsRestock: calculatedStock <= (item.min_stock || 0),
        createdAt: new Date(item.created_at)
      };
    });

    const end = Date.now();
    console.log(`--- Busca Supabase finalizada em ${end - start}ms ---`);

    return { success: true, data: processedItems };
  } catch (error) {
    console.error("Erro ao buscar itens no Supabase:", error);
    return { success: false, error: "Erro ao carregar itens." };
  }
};

// Buscar item por ID
export const getItemById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data: {
        ...data,
        isActive: data.is_active,
        photoUrl: data.photo_url,
        currentStock: data.current_stock,
        minStock: data.min_stock,
        createdAt: new Date(data.created_at)
      }
    };
  } catch (error) {
    return { success: false, error: "Item não encontrado" };
  }
};

// Atualizar item
export const updateItem = async (id, itemData) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        name: itemData.name.trim(),
        description: itemData.description?.trim() || '',
        photo_url: itemData.photoUrl || '',
        is_active: itemData.isActive !== undefined ? itemData.isActive : true
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Item atualizado com sucesso!" };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar item." };
  }
};

// Deletar item (desativar)
export const deleteItem = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Item desativado com sucesso!" };
  } catch (error) {
    return { success: false, error: "Erro ao desativar item." };
  }
};
