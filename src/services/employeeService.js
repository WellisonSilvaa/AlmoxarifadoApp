// src/services/employeeService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// Criar novo funcionário
export const createEmployee = async (employeeData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const docRef = await addDoc(collection(db, 'employees'), {
      ...employeeData,
      createdAt: new Date(),
      createdBy: user.uid,
      isActive: true
    });

    return { 
      success: true, 
      id: docRef.id, 
      message: "Funcionário cadastrado com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    let errorMessage = "Erro ao cadastrar funcionário. Tente novamente.";
    
    if (error.code === 'permission-denied') {
      errorMessage = "Permissão negada. Verifique as regras do Firestore.";
    }
    
    return { success: false, error: errorMessage };
  }
};

// Buscar todos os funcionários
export const getEmployees = async () => {
  try {
    const q = query(
      collection(db, 'employees'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const employees = [];
    
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: employees };
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return { success: false, error: "Erro ao carregar funcionários." };
  }
};

// Atualizar funcionário
export const updateEmployee = async (id, employeeData) => {
  try {
    const employeeRef = doc(db, 'employees', id);
    await updateDoc(employeeRef, employeeData);
    
    return { success: true, message: "Funcionário atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    return { success: false, error: "Erro ao atualizar funcionário." };
  }
};

// Deletar funcionário (desativar)
export const deleteEmployee = async (id) => {
  try {
    const employeeRef = doc(db, 'employees', id);
    await updateDoc(employeeRef, { isActive: false });
    
    return { success: true, message: "Funcionário desativado com sucesso!" };
  } catch (error) {
    console.error("Erro ao desativar funcionário:", error);
    return { success: false, error: "Erro ao desativar funcionário." };
  }
};