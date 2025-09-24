import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { createTruck } from '../services/truckService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';

const TruckFormScreen = ({ navigation }) => {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acesso à sua galeria para selecionar fotos.');
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
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acesso à sua câmera para tirar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        mediaTypes: 'Images',
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const formatPlate = (text) => {
    // Formatar placa no padrão AAA-0A00 ou AAA0A00
    let formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (formatted.length > 7) {
      formatted = formatted.substring(0, 7);
    }
    
    if (formatted.length > 3) {
      formatted = formatted.substring(0, 3) + '-' + formatted.substring(3);
    }
    
    return formatted;
  };

  const validateForm = () => {
    if (!plate.trim()) {
      Alert.alert('Erro', 'Por favor, informe a placa da carreta');
      return false;
    }

    // Validar formato da placa (AAA-0A00 ou AAA0A00)
    const plateRegex = /^[A-Z]{3}[-]?[0-9][A-Z0-9][0-9]{2}$/;
    const cleanPlate = plate.replace('-', '');
    
    if (!plateRegex.test(plate) && cleanPlate.length !== 7) {
      Alert.alert('Erro', 'Por favor, informe uma placa válida');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let photoUrl = '';

      // Upload da imagem se existir
      if (image) {
        setUploading(true);
        const uploadResult = await uploadImage(image, 'trucks/');
        setUploading(false);
        
        if (uploadResult.success) {
          photoUrl = uploadResult.url;
        } else {
          Alert.alert('Erro', 'Falha no upload da imagem');
          setLoading(false);
          return;
        }
      }

      // Criar carreta no Firestore
      const result = await createTruck({
        plate: plate.replace('-', ''), // Remove o hífen para salvar
        model,
        brand,
        year: year ? parseInt(year) : null,
        capacity,
        photoUrl
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
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Cadastrar Carreta</Text>

        <Text style={{
          marginBottom: 20,
          color: colors.dark,
          fontSize: 16
        }}>
          Preencha os dados da carreta
        </Text>

        {/* Placa (Obrigatório) */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Placa *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Ex: ABC-1D23 ou ABC1D23"
          placeholderTextColor={colors.gray}
          value={plate}
          onChangeText={(text) => setPlate(formatPlate(text))}
          maxLength={8}
          editable={!loading}
        />

        {/* Marca e Modelo em Linha */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Marca</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: Volvo, Mercedes"
              placeholderTextColor={colors.gray}
              value={brand}
              onChangeText={setBrand}
              editable={!loading}
            />
          </View>
          
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Modelo</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: FH 540, Actros"
              placeholderTextColor={colors.gray}
              value={model}
              onChangeText={setModel}
              editable={!loading}
            />
          </View>
        </View>

        {/* Ano e Capacidade em Linha */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Ano</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: 2023"
              placeholderTextColor={colors.gray}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              maxLength={4}
              editable={!loading}
            />
          </View>
          
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Capacidade</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: 30 toneladas"
              placeholderTextColor={colors.gray}
              value={capacity}
              onChangeText={setCapacity}
              editable={!loading}
            />
          </View>
        </View>

        {/* Upload de Imagem */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Foto da Carreta</Text>
        
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 150, alignSelf: 'center', marginBottom: 15, borderRadius: 10 }}
            resizeMode="cover"
          />
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <TouchableOpacity
            style={[globalStyles.button, { flex: 1, marginRight: 5, backgroundColor: colors.secondary }]}
            onPress={pickImage}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>📁 Galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { flex: 1, marginLeft: 5, backgroundColor: colors.primary }]}
            onPress={takePhoto}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>📷 Câmera</Text>
          </TouchableOpacity>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={[globalStyles.button, loading && { backgroundColor: colors.gray }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>🚚 Cadastrar Carreta</Text>
          )}
        </TouchableOpacity>

        {uploading && (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ color: colors.gray, fontSize: 12 }}>Fazendo upload da imagem...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: colors.danger }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 20, color: colors.gray, fontSize: 12, fontStyle: 'italic' }}>
          * Campos obrigatórios
        </Text>
      </View>
    </ScrollView>
  );
};

export default TruckFormScreen;