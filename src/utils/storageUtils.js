
import { supabase } from '../services/supabase';

export const uploadImage = async (uri, path = 'items') => {
  try {
    console.log('--- Iniciando Upload para Supabase Storage ---');
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const timestamp = new Date().getTime();
    const extension = uri.split('.').pop();
    const filename = `item_${timestamp}.${extension}`;
    const filePath = `${filename}`; 

    const { data, error } = await supabase.storage
      .from(path)
      .upload(filePath, blob, {
        contentType: 'image/jpeg'
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(path)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl, isBase64: false };
  } catch (error) {
    console.warn('Erro no Upload Supabase, tentando fallback para base64:', error);
    return convertToBase64(uri);
  }
};

const convertToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ 
          success: true, 
          url: reader.result,
          isBase64: true
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return { success: false, error: 'Falha ao processar imagem' };
  }
};

export const getImageUrl = (imageData) => {
  if (!imageData) return null;
  if (typeof imageData === 'string') return imageData;
  return imageData.url;
};