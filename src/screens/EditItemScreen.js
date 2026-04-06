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
  Switch,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { colors, typography } from '../styles/global';
import { getItemById, updateItem } from '../services/itemService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const EditItemScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Acesso à galeria negado.');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCurrentImageUrl('');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Acesso à câmera negado.');
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCurrentImageUrl('');
    }
  };

  const handleImagePress = () => {
    Alert.alert('Atualizar Foto', 'Selecione a fonte da imagem:', [
      { text: '📷 Tirar Foto', onPress: takePhoto },
      { text: '📁 Galeria', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'O nome do item é obrigatório.');
    
    setSaving(true);
    let photoUrl = currentImageUrl;

    try {
      if (image) {
        setUploading(true);
        const uploadResult = await uploadImage(image, 'items/');
        setUploading(false);
        if (uploadResult.success) photoUrl = uploadResult.url;
      }

      const result = await updateItem(itemId, {
        name,
        description,
        photoUrl,
        isActive
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Item atualizado com sucesso!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Produto</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Hero */}
        <TouchableOpacity style={styles.heroImageContainer} onPress={handleImagePress}>
          <Image 
            source={{ uri: image || currentImageUrl || 'https://via.placeholder.com/400' }} 
            style={styles.heroImage} 
          />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.heroOverlay}>
              <Text style={styles.editPhotoLabel}>Alterar Fotografia</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pneu 295/80"
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição Detalhada</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adicione especificações técnicas..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!saving}
            />
          </View>

          <View style={styles.statusRow}>
              <View>
                  <Text style={styles.statusTitle}>Disponibilidade</Text>
                  <Text style={styles.statusDesc}>{isActive ? 'Item visível para novas operações' : 'Item oculto no estoque'}</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={saving}
                trackColor={{ false: '#ddd', true: colors.primary + '40' }}
                thumbColor={isActive ? colors.primary : '#999'}
              />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={saving}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryVariant]}
              style={styles.gradientButton}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.cancelText}>Descartar Mudanças</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    height: 85, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.surfaceVariant,
    paddingTop: 25,
  },
  headerTitle: { ...typography.headline, fontSize: 18, color: colors.primary },
  backButton: { padding: 8 },
  scrollContent: { paddingBottom: 40 },
  heroImageContainer: { height: 280, backgroundColor: '#eee', position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, justifyContent: 'center', alignItems: 'center' },
  editPhotoLabel: { color: '#fff', ...typography.label, fontSize: 14 },
  formSection: { padding: 24 },
  inputGroup: { marginBottom: 24 },
  label: { ...typography.label, fontSize: 12, color: colors.onSurface, marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: '#ddd',
    ...typography.body,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  statusRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: colors.surfaceContainerLow, 
    padding: 20, 
    borderRadius: 20,
    marginTop: 8,
  },
  statusTitle: { ...typography.title, fontSize: 16, color: colors.primary },
  statusDesc: { ...typography.body, fontSize: 12, color: colors.secondary, marginTop: 2 },
  footer: { paddingHorizontal: 24, gap: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.secondary, fontSize: 16 },
});

export default EditItemScreen;