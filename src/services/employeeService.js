
// src/services/employeeService.js
import { supabase } from './supabase';

const TABLE_NAME = 'employees';

// Criar novo funcionário
export const createEmployee = async (employeeData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuário não autenticado" };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      id: data.id, 
      message: "Funcionário cadastrado com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar funcionário no Supabase:", error);
    return { success: false, error: "Erro ao cadastrar funcionário." };
  }
};

// Buscar todos os funcionários
export const getEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { 
      success: true, 
      data: data.map(e => ({
        ...e,
        isActive: e.is_active
      }))
    };
  } catch (error) {
    console.error("Erro ao buscar funcionários no Supabase:", error);
    return { success: false, error: "Erro ao carregar funcionários." };
  }
};

// Atualizar funcionário
export const updateEmployee = async (id, employeeData) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(employeeData)
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Funcionário atualizado com sucesso!" };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar funcionário." };
  }
};

// Deletar funcionário (desativar)
export const deleteEmployee = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "Funcionário desativado com sucesso!" };
  } catch (error) {
    return { success: false, error: "Erro ao desativar funcionário." };
  }
};