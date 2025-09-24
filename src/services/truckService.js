import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// Criar nova carreta
export const createTruck = async (truckData) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Validar placa (formato básico)
    if (!truckData.plate || truckData.plate.trim().length < 6) {
      return { success: false, error: "Placa é obrigatória e deve ter pelo menos 6 caracteres" };
    }

    const docRef = await addDoc(collection(db, 'trucks'), {
      plate: truckData.plate.trim().toUpperCase(),
      model: truckData.model?.trim() || '',
      brand: truckData.brand?.trim() || '',
      year: truckData.year || null,
      capacity: truckData.capacity?.trim() || '',
      photoUrl: truckData.photoUrl || '',
      isActive: true,
      createdAt: new Date(),
      createdBy: user.uid
    });

    return { 
      success: true, 
      id: docRef.id, 
      message: "Carreta cadastrada com sucesso!" 
    };
  } catch (error) {
    console.error("Erro ao criar carreta:", error);
    return { success: false, error: "Erro ao cadastrar carreta." };
  }
};

// Buscar todas as carretas
export const getTrucks = async () => {
  try {
    const q = query(
      collection(db, 'trucks'), 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trucks = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      trucks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt 
          ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
          : new Date()
      });
    });
    
    return { success: true, data: trucks };
  } catch (error) {
    console.error("Erro ao buscar carretas:", error);
    return { success: false, error: "Erro ao carregar carretas." };
  }
};

// Buscar carreta por ID
export const getTruckById = async (id) => {
  try {
    const truckRef = doc(db, 'trucks', id);
    const docSnap = await getDocs(truckRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        success: true, 
        data: { 
          id: docSnap.id, 
          ...data,
          createdAt: data.createdAt 
            ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
            : new Date()
        } 
      };
    } else {
      return { success: false, error: "Carreta não encontrada" };
    }
  } catch (error) {
    console.error("Erro ao buscar carreta:", error);
    return { success: false, error: "Erro ao carregar carreta." };
  }
};