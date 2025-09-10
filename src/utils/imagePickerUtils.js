import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const requestMediaPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

export const requestCameraPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const pickImageFromGallery = async () => {
  try {
    const hasPermission = await requestMediaPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permissão necessária', 'Precisamos acesso à sua galeria.');
      return { cancelled: true };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result;
  } catch (error) {
    console.error('Erro ao selecionar imagem:', error);
    return { cancelled: true };
  }
};

export const takePhotoWithCamera = async () => {
  try {
    const hasPermission = await requestCameraPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permissão necessária', 'Precisamos acesso à sua câmera.');
      return { cancelled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result;
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    return { cancelled: true };
  }
};