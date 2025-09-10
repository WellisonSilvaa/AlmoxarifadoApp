import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

export const uploadImage = async (uri, path = 'items/') => {
  try {
    console.log('Convertendo imagem para base64...');
    
    // Verificar se o Storage está disponível
    if (!storage) {
      console.log('Storage não disponível, usando base64...');
      return convertToBase64(uri);
    }

    // Tentar usar Firebase Storage primeiro
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Criar nome único para o arquivo
      const timestamp = new Date().getTime();
      const extension = uri.split('.').pop();
      const filename = `item_${timestamp}.${extension}`;
      
      const storageRef = ref(storage, path + filename);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadUrl, isBase64: false };
    } catch (storageError) {
      console.log('Erro no Storage, usando base64:', storageError);
      return convertToBase64(uri);
    }
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    return { success: false, error: error.message };
  }
};

// Função para converter para base64
const convertToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve({ 
          success: true, 
          url: base64data,
          isBase64: true
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter para base64:', error);
    return { success: false, error: 'Falha ao processar imagem' };
  }
};

// Função para exibir imagens
export const getImageUrl = (imageData) => {
  if (!imageData) return null;
  
  if (typeof imageData === 'string') {
    return imageData; // URL simples
  }
  
  if (imageData.isBase64) {
    return imageData.url; // Base64
  }
  
  return imageData.url; // URL do Storage
};