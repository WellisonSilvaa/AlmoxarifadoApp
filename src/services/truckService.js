
// src/services/truckService.js
import { supabase } from './supabase';

const TABLE_NAME = 'trucks';

// Criar nova carreta
export const createTruck = async (truckData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        plate: truckData.plate.trim().toUpperCase(),
        brand: truckData.brand?.trim() || '',
        model: truckData.model?.trim() || '',
        year: truckData.year || null,
        capacity: truckData.capacity || '',
        photo_url: truckData.photoUrl || '',
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      id: data.id, 
      message: "Carreta cadastrada com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar carreta no Supabase:", error);
    return { success: false, error: "Erro ao cadastrar carreta." };
  }
};

// Buscar todas as carretas
export const getTrucks = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { 
      success: true, 
      data: data.map(t => ({
        ...t,
        isActive: t.is_active,
        photoUrl: t.photo_url,
        createdAt: new Date(t.created_at)
      }))
    };
  } catch (error) {
    console.error("Erro ao buscar carretas no Supabase:", error);
    return { success: false, error: "Erro ao carregar carretas." };
  }
};

// Buscar carreta por ID
export const getTruckById = async (id) => {
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
        createdAt: new Date(data.created_at)
      } 
    };
  } catch (error) {
    return { success: false, error: "Carreta não encontrada" };
  }
};

// Atualizar carreta
export const updateTruck = async (id, truckData) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        plate: truckData.plate.trim().toUpperCase(),
        brand: truckData.brand?.trim() || '',
        model: truckData.model?.trim() || '',
        year: truckData.year || null,
        capacity: truckData.capacity || '',
        photo_url: truckData.photoUrl || '',
        is_active: truckData.isActive !== undefined ? truckData.isActive : true
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Carreta atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar carreta no Supabase:", error);
    return { success: false, error: "Erro ao atualizar carreta." };
  }
};

// Deletar carreta (desativar)
export const deleteTruck = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Carreta desativada com sucesso!" };
  } catch (error) {
    return { success: false, error: "Erro ao desativar carreta." };
  }
};