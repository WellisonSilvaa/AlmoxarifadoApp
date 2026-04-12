
// src/services/authService.js
import { createClient } from '@supabase/supabase-js';
import { supabase as mainSupabase } from './supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 1. Cliente principal (gerencia a sessão do usuário logado no app)
export const supabase = mainSupabase;

// 2. Cliente secundário exclusivo para cadastro (NÃO altera a sessão atual)
const supabaseAuthOnly = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Registrar novo usuário (admin ou inicial) - Usa o cliente principal para logar o novo admin após criar
export const registerUser = async (email, password, name, role = 'admin') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) throw error;

    // Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id, 
          name: name, 
          role: role,
          is_active: true
        }
      ]);

    if (profileError) throw profileError;
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro no registerUser:', error);
    return { success: false, error: error.message };
  }
};

// Registrar funcionário (Sem deslogar o Admin)
// Nota: Para este método funcionar sem confirmação de e-mail,
// desative "Confirm Email" no Dashboard do Supabase.
export const registerEmployee = async (email, password, name, employeeId) => {
  try {
    console.log('--- Iniciando cadastro silencioso de funcionário ---');
    
    // Usamos o cliente supabaseAuthOnly para não sobrescrever o token do Admin atual
    const { data, error } = await supabaseAuthOnly.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) throw error;

    if (!data.user) {
        throw new Error("Erro ao criar usuário no Auth");
    }

    // Usamos o cliente PRINCIPAL (supabase) para salvar o perfil na DB, 
    // pois o Admin tem permissão para escrever na tabela profiles.
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id, 
          name: name, 
          role: 'employee',
          employee_id: employeeId,
          is_active: true
        }
      ]);

    if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
    }

    console.log('--- Funcionário cadastrado com sucesso (Auth e Perfil) ---');
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro no registerEmployee:', error);
    return { success: false, error: error.message };
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Verificar se perfil existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Perfil não encontrado, criando um básico...');
      await supabase.from('profiles').insert([{ 
        id: data.user.id, 
        name: data.user.user_metadata?.full_name || email.split('@')[0], 
        role: 'employee' 
      }]);
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: "Credenciais inválidas ou erro de conexão" };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Observador de estado de autenticação
export const onAuthStateChanged = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
};

// Verificar se usuário é admin
export const isAdmin = async (userId) => {
  try {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) return false;
    return data.role === 'admin';
  } catch (error) {
    return false;
  }
};

// Obter dados do usuário atual
export const getCurrentUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { success: true, data: { ...user, ...profile } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkIsAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return await isAdmin(user.id);
};

export const canCreateEmployee = async () => {
  try {
    const is_admin = await checkIsAdmin();
    if (is_admin) return true;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, employee_id')
      .eq('id', user.id)
      .single();

    if (profile?.employee_id) {
      const { data: employee } = await supabase
        .from('employees')
        .select('position')
        .eq('id', profile.employee_id)
        .single();
      
      const pos = (employee?.position || '').toLowerCase();
      return pos.includes('lider') || pos.includes('líder');
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar permissão para cadastrar funcionário:", error);
    return false;
  }
};