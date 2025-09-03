// src/services/authService.js
// Importações para Firebase v12
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';

// Registrar novo usuário
export const registerUser = async (email, password, name) => {
  try {
    // Validação adicional
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nome deve ter pelo menos 2 caracteres" };
    }

    if (!email || !password) {
      return { success: false, error: "Email e senha são obrigatórios" };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar perfil do usuário com o nome
    await updateProfile(userCredential.user, {
      displayName: name.trim()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = "Erro ao criar usuário";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Este email já está em uso.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email inválido.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "A senha é muito fraca.";
    }
    
    return { success: false, error: errorMessage };
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = "Erro ao fazer login";
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = "Usuário não encontrado.";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Senha incorreta.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email inválido.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
    }
    
    return { success: false, error: errorMessage };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Observador de estado de autenticação
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};