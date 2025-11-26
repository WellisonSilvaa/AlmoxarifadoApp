// src/services/authService.js
// Importações para Firebase v12
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

// Registrar novo usuário (admin)
export const registerUser = async (email, password, name, role = 'admin') => {
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

    // Criar documento de usuário no Firestore com role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name.trim(),
      role: role, // 'admin' ou 'employee'
      createdAt: new Date(),
      isActive: true
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

// Registrar funcionário (cria conta de autenticação)
export const registerEmployee = async (email, password, name, employeeId) => {
  try {
    console.log('registerEmployee: Iniciando criação de conta para:', email);
    
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nome deve ter pelo menos 2 caracteres" };
    }

    if (!email || !password) {
      return { success: false, error: "Email e senha são obrigatórios" };
    }

    let userCredential;
    
    try {
      // Tentar criar a conta de autenticação
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('registerEmployee: Conta criada com sucesso:', userCredential.user.uid);
    } catch (authError) {
      console.error('registerEmployee: Erro ao criar conta:', authError.code, authError.message);
      
      // Se o email já está em uso, tentar vincular a conta existente
      if (authError.code === 'auth/email-already-in-use') {
        console.log('registerEmployee: Email já está em uso, buscando usuário existente...');
        
        // Buscar se já existe um documento do usuário com este email
        const usersQuery = query(
          collection(db, 'users'),
          where('email', '==', email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          // Usuário já existe na collection users
          const existingUserDoc = usersSnapshot.docs[0];
          const existingUserData = existingUserDoc.data();
          
          console.log('registerEmployee: Usuário encontrado na collection users:', existingUserData);
          
          // Atualizar o documento com o employeeId se ainda não tiver
          if (!existingUserData.employeeId) {
            await updateDoc(doc(db, 'users', existingUserDoc.id), {
              employeeId: employeeId,
              role: 'employee',
              name: name.trim()
            });
            console.log('registerEmployee: Documento atualizado com employeeId');
          }
          
          return { 
            success: true, 
            user: { uid: existingUserDoc.id },
            message: "Conta já existia e foi vinculada ao funcionário"
          };
        } else {
          // Conta existe no Auth mas não na collection users
          // Não podemos acessar o UID sem fazer login, então retornar erro
          return { 
            success: false, 
            error: "Este email já está cadastrado no sistema. Por favor, use outro email ou entre em contato com o administrador." 
          };
        }
      }
      
      // Outros erros de autenticação
      let errorMessage = "Erro ao criar conta do funcionário";
      
      if (authError.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (authError.code === 'auth/network-request-failed') {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else {
        errorMessage = `Erro ao criar conta: ${authError.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
    
    // Se chegou aqui, a conta foi criada com sucesso
    // Atualizar perfil do usuário com o nome
    try {
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });
      console.log('registerEmployee: Perfil atualizado com sucesso');
    } catch (profileError) {
      console.warn('registerEmployee: Erro ao atualizar perfil (continuando):', profileError);
      // Não bloquear se falhar atualizar o perfil
    }

    // Criar documento de usuário no Firestore com role de employee
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        name: name.trim(),
        role: 'employee',
        employeeId: employeeId, // ID do documento na collection employees
        createdAt: new Date(),
        isActive: true
      });
      console.log('registerEmployee: Documento criado na collection users com sucesso');
    } catch (firestoreError) {
      console.error('registerEmployee: Erro ao criar documento no Firestore:', firestoreError);
      
      // Se falhar ao criar o documento, tentar atualizar se já existir
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          employeeId: employeeId,
          role: 'employee',
          name: name.trim(),
          email: email
        });
        console.log('registerEmployee: Documento atualizado (já existia)');
      } else {
        // Se não conseguir criar nem atualizar, retornar erro
        throw new Error('Não foi possível criar o documento do usuário no Firestore');
      }
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('registerEmployee: Erro geral:', error);
    return { 
      success: false, 
      error: error.message || "Erro desconhecido ao criar conta do funcionário" 
    };
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verificar se o usuário tem documento na collection users
    // Se não tiver, pode ser um usuário antigo - tentar criar documento básico
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('Usuário não tem documento na collection users, criando documento básico...');
      
      // Tentar buscar se é funcionário pela collection employees
      const employeesQuery = query(
        collection(db, 'employees'),
        where('email', '==', email),
        where('isActive', '==', true)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      
      let role = 'employee';
      let employeeId = null;
      
      if (!employeesSnapshot.empty) {
        // É um funcionário
        const employeeDoc = employeesSnapshot.docs[0];
        employeeId = employeeDoc.id;
        role = 'employee';
      } else {
        // Pode ser um admin antigo - verificar se tem algum admin no sistema
        // Por padrão, assumir que é admin se não encontrar como funcionário
        role = 'admin';
      }
      
      // Criar documento do usuário
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email || email,
        name: user.displayName || email.split('@')[0],
        role: role,
        employeeId: employeeId,
        createdAt: new Date(),
        isActive: true
      });
    }
    
    return { success: true, user: user };
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
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = "Email ou senha incorretos.";
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

// Verificar se usuário é admin
export const isAdmin = async (userId) => {
  try {
    if (!userId) {
      return false;
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    return userData.role === 'admin';
  } catch (error) {
    console.error("Erro ao verificar se é admin:", error);
    return false;
  }
};

// Obter dados do usuário atual (incluindo role)
export const getCurrentUserData = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, error: "Dados do usuário não encontrados" };
    }

    return { 
      success: true, 
      data: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc.data()
      }
    };
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return { success: false, error: "Erro ao carregar dados do usuário" };
  }
};

// Verificar se usuário atual é admin
export const checkIsAdmin = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }

    return await isAdmin(user.uid);
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return false;
  }
};

// Verificar se usuário pode cadastrar funcionários (admin ou líder)
export const canCreateEmployee = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      console.log('canCreateEmployee: Usuário não autenticado');
      return false;
    }

    // Verificar se é admin
    const admin = await isAdmin(user.uid);
    if (admin) {
      console.log('canCreateEmployee: Usuário é admin - pode cadastrar funcionários');
      return true;
    }

    // Se não for admin, verificar se é funcionário com posição "lider"
    const userData = await getCurrentUserData();
    
    if (!userData.success) {
      console.log('canCreateEmployee: Erro ao obter dados do usuário:', userData.error);
      return false;
    }

    if (userData.data.role !== 'employee') {
      console.log('canCreateEmployee: Usuário não é employee, role:', userData.data.role);
      return false;
    }

    // Buscar dados do funcionário na collection employees
    if (!userData.data.employeeId) {
      console.log('canCreateEmployee: Employee não tem employeeId');
      return false;
    }

    const employeeDoc = await getDoc(doc(db, 'employees', userData.data.employeeId));
    
    if (!employeeDoc.exists()) {
      console.log('canCreateEmployee: Documento do employee não encontrado');
      return false;
    }

    const employeeData = employeeDoc.data();
    const position = (employeeData.position || '').toLowerCase().trim();
    
    console.log('canCreateEmployee: Posição do funcionário:', position);
    
    // Verificar se a posição é "lider" ou "líder"
    const isLeader = position === 'lider' || position === 'líder';
    
    if (isLeader) {
      console.log('canCreateEmployee: Funcionário é líder - pode cadastrar funcionários');
    } else {
      console.log('canCreateEmployee: Funcionário não é líder - não pode cadastrar funcionários');
    }
    
    return isLeader;
  } catch (error) {
    console.error("Erro ao verificar permissão para cadastrar funcionário:", error);
    return false;
  }
};