import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Switch
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getItemById, updateItem } from '../services/itemService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';

const EditItemScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const result = await getItemById(itemId);
      
      if (result.success) {
        const item = result.data;
        setName(item.name);
        setDescription(item.description || '');
        setCurrentImageUrl(item.photoUrl || '');
        setIsActive(item.isActive !== undefined ? item.isActive : true);
      } else {
        Alert.alert('Erro', result.error);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o item');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acesso à sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setCurrentImageUrl(''); // Remove a imagem anterior se selecionar nova
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do item');
      return;
    }

    setSaving(true);
    let photoUrl = currentImageUrl;

    try {
      // Upload da nova imagem se existir
      if (image) {
        setUploading(true);
        const uploadResult = await uploadImage(image, 'items/');
        setUploading(false);
        
        if (uploadResult.success) {
          photoUrl = uploadResult.url;
        } else {
          Alert.alert('Erro', 'Falha no upload da imagem');
          setSaving(false);
          return;
        }
      }

      // Atualizar item
      const result = await updateItem(itemId, {
        name,
        description,
        photoUrl,
        isActive
      });

      if (result.success) {
        Alert.alert('Sucesso', result.message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando item...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Editar Item</Text>

        {/* Campo Nome */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Nome do Item *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Nome do item"
          value={name}
          onChangeText={setName}
          editable={!saving}
        />

        {/* Campo Descrição */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Descrição</Text>
        <TextInput
          style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Descrição do item..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!saving}
        />

        {/* Imagem Atual */}
        {(currentImageUrl || image) && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Imagem:</Text>
            <Image
              source={{ uri: image || currentImageUrl }}
              style={{ width: 200, height: 200, alignSelf: 'center', borderRadius: 10 }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Upload de Nova Imagem */}
        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: colors.secondary, marginBottom: 15 }]}
          onPress={pickImage}
          disabled={saving}
        >
          <Text style={globalStyles.buttonText}>
            {currentImageUrl ? '🔄 Trocar Imagem' : '📁 Adicionar Imagem'}
          </Text>
        </TouchableOpacity>

        {/* Status Ativo/Inativo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={saving}
            thumbColor={isActive ? colors.primary : colors.gray}
          />
          <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>
            Item {isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={[globalStyles.button, saving && { backgroundColor: colors.gray }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>💾 Salvar Alterações</Text>
          )}
        </TouchableOpacity>

        {uploading && (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ color: colors.gray, fontSize: 12 }}>Processando imagem...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: colors.danger }]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={globalStyles.buttonText}>❌ Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditItemScreen;