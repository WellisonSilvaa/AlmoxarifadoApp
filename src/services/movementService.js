
// src/services/movementService.js
import { supabase } from './supabase';

const TABLE_NAME = 'movements';

// Criar nova movimentação
export const createMovement = async (movementData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        item_id: movementData.itemId,
        item_name: movementData.itemName,
        type: movementData.type,
        quantity: movementData.quantity,
        employee_id: user.id,
        employee_name: movementData.responsible,
        truck_plate: movementData.truckPlate || '',
        date: new Date()
      }])
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      id: data.id, 
      message: "Movimentação registrada com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar movimentação no Supabase:", error);
    return { success: false, error: "Erro ao registrar movimentação." };
  }
};

// Obter todas as movimentações
export const getMovements = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      data: data.map(m => ({
        ...m,
        id: m.id,
        itemId: m.item_id,
        itemName: m.item_name,
        employeeId: m.employee_id,
        employeeName: m.employee_name,
        responsible: m.employee_name, // Map para compatibilidade
        truckPlate: m.truck_plate,
        date: new Date(m.date)
      })) 
    };
  } catch (error) {
    console.error("Erro ao buscar movimentações no Supabase:", error);
    return { success: false, error: "Erro ao carregar movimentações." };
  }
};

// Buscar por Item
export const getMovementsByItem = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('item_id', itemId)
      .order('date', { ascending: false });

    if (error) throw error;

    return { 
      success: true, 
      data: data.map(m => ({
        ...m,
        id: m.id,
        itemId: m.item_id,
        itemName: m.item_name,
        responsible: m.employee_name, // Map para compatibilidade
        date: new Date(m.date)
      })) 
    };
  } catch (error) {
    return { success: false, error: "Erro ao buscar histórico." };
  }
};

// Buscar por ID
export const getMovementById = async (id) => {
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
        id: data.id,
        itemId: data.item_id,
        itemName: data.item_name,
        employeeId: data.employee_id,
        employeeName: data.employee_name,
        responsible: data.employee_name, // Map para compatibilidade
        truckPlate: data.truck_plate,
        date: new Date(data.date)
      }
    };
  } catch (error) {
    console.error("Erro ao buscar movimentação no Supabase:", error);
    return { success: false, error: "Erro ao carregar os detalhes da movimentação." };
  }
};