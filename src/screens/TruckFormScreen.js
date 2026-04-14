
// src/screens/TruckFormScreen.js
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
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { createTruck, updateTruck, getTruckById } from '../services/truckService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

const TruckFormScreen = ({ route, navigation }) => {
  const truckId = route?.params?.truckId;
  const isEditing = !!truckId;
  const { refreshData } = useData();

  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [isNewImage, setIsNewImage] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadTruckDetails();
    }
  }, [truckId]);

  const loadTruckDetails = async () => {
    try {
      const result = await getTruckById(truckId);
      if (result.success) {
        const truck = result.data;
        setPlate(formatPlate(truck.plate));
        setModel(truck.model || '');
        setBrand(truck.brand || '');
        setYear(truck.year ? truck.year.toString() : '');
        setCapacity(truck.capacity || '');
        setImage(truck.photoUrl || null);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados da carreta.');
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setIsNewImage(true);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acesso à sua câmera.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setIsNewImage(true);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const handleImagePress = () => {
    Alert.alert(
      'Foto da Carreta',
      'Como deseja selecionar a foto?',
      [
        { text: '📷 Tirar Foto', onPress: takePhoto },
        { text: '📁 Galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const formatPlate = (text) => {
    let formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (formatted.length > 7) formatted = formatted.substring(0, 7);
    if (formatted.length > 3) {
        // Se for placa antiga (3 letras - 4 numeros) ou Mercosul
        formatted = formatted.substring(0, 3) + '-' + formatted.substring(3);
    }
    return formatted;
  };

  const handleSubmit = async () => {
    if (!plate.trim()) {
      Alert.alert('Atenção', 'A placa da carreta é obrigatória.');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = image;
      
      // Só faz upload se for uma nova imagem selecionada (URI local)
      if (isNewImage && image) {
        setUploading(true);
        const uploadResult = await uploadImage(image, 'trucks');
        setUploading(false);
        if (uploadResult.success) photoUrl = uploadResult.url;
      }

      const truckData = {
        plate: plate.replace('-', ''),
        model,
        brand,
        year: year ? parseInt(year) : null,
        capacity,
        photoUrl: photoUrl || ''
      };

      let result;
      if (isEditing) {
        result = await updateTruck(truckId, truckData);
      } else {
        result = await createTruck(truckData);
      }

      if (result.success) {
        refreshData(); // ⚡ Sync em background
        navigation.goBack(); // 🚄 Volta instantaneamente
      } else {
        Alert.alert('Erro', result.error);
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.secondary }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Editar Carreta' : 'Nova Carreta'}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imageSelector} onPress={handleImagePress}>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <View style={styles.editBadge}>
                <Text style={{ color: '#fff', fontSize: 12 }}>Editar</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>🚚</Text>
              <Text style={styles.placeholderLabel}>Adicionar Foto do Veículo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa do Veículo *</Text>
            <TextInput
              style={[styles.input, styles.plateInput]}
              placeholder="ABC-1D23"
              placeholderTextColor={colors.secondary + '60'}
              value={plate}
              onChangeText={(text) => setPlate(formatPlate(text))}
              maxLength={8}
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Scania"
                placeholderTextColor={colors.secondary + '60'}
                value={brand}
                onChangeText={setBrand}
                editable={!loading}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Modelo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: R 450"
                placeholderTextColor={colors.secondary + '60'}
                value={model}
                onChangeText={setModel}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ano</Text>
              <TextInput
                style={styles.input}
                placeholder="2023"
                placeholderTextColor={colors.secondary + '60'}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
                editable={!loading}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Capacidade</Text>
              <TextInput
                style={styles.input}
                placeholder="30t"
                placeholderTextColor={colors.secondary + '60'}
                value={capacity}
                onChangeText={setCapacity}
                editable={!loading}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryVariant]}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {uploading && (
            <Text style={styles.uploadText}>Processando imagem...</Text>
          )}

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancelar e Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
  backButton: { padding: 8 },
  headerTitle: { ...typography.headline, fontSize: 18, color: colors.primary },
  scrollContent: { paddingBottom: 40 },
  imageSelector: { height: 200, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  imageWrapper: { width: '100%', height: '100%' },
  selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  editBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  imagePlaceholder: { alignItems: 'center' },
  placeholderIcon: { fontSize: 44, marginBottom: 10 },
  placeholderLabel: { ...typography.body, color: colors.secondary, fontSize: 14 },
  formContainer: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 16 },
  label: { ...typography.label, fontSize: 13, color: colors.onSurface, marginBottom: 8, paddingLeft: 4 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...typography.body,
  },
  plateInput: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, paddingVertical: 16, color: colors.primary },
  footer: { paddingHorizontal: 24, marginTop: 10 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff', textTransform: 'none' },
  uploadText: { textAlign: 'center', color: colors.secondary, fontSize: 12, marginTop: 8 },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  cancelText: { ...typography.label, fontSize: 16, color: colors.secondary, textTransform: 'none' },
});

export default TruckFormScreen;