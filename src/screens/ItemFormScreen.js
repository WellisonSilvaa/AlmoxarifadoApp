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
import { createItem } from '../services/itemService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';

const ItemFormScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // const MediaType = {
    //     Images: 'Images',
    //     Videos: 'Videos',
    //     All: 'All',
    // };

    const pickImage = async () => {
        try {
            console.log('Abrindo galeria...');

            // Solicitar permissões
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Status da permissão da galeria:', status);

            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos acesso à sua galeria para selecionar fotos.');
                return;
            }

            // Abrir galeria
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            console.log('Resultado da galeria:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                console.log('Imagem selecionada:', result.assets[0].uri);
            } else if (result.canceled) {
                console.log('Usuário cancelou a seleção');
            }
        } catch (error) {
            console.error('Erro detalhado na galeria:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem. Verifique as permissões.');
        }
    };

    const takePhoto = async () => {
        try {
            console.log('Abrindo câmera...');

            // Solicitar permissões
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            console.log('Status da permissão da câmera:', status);

            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos acesso à sua câmera para tirar fotos.');
                return;
            }

            // Abrir câmera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                mediaTypes: 'images',
            });

            console.log('Resultado da câmera:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
                console.log('Foto tirada:', result.assets[0].uri);
            } else if (result.canceled) {
                console.log('Usuário cancelou a foto');
            }
        } catch (error) {
            console.error('Erro detalhado na câmera:', error);
            Alert.alert('Erro', 'Não foi possível abrir a câmera. Verifique as permissões.');
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Por favor, informe o nome do item');
            return;
        }

        setLoading(true);
        let photoUrl = '';

        try {
            // Upload da imagem se existir
            if (image) {
                setUploading(true);
                const uploadResult = await uploadImage(image, 'items/');
                setUploading(false);

                if (uploadResult.success) {
                    photoUrl = uploadResult.url;

                    // Alertar sobre limitações do base64
                    if (uploadResult.isBase64) {
                        Alert.alert(
                            'Aviso',
                            'Imagem armazenada localmente (modo gratuito). Para melhor performance, ative o Firebase Storage.',
                            [{ text: 'OK' }]
                        );
                    }
                } else {
                    Alert.alert('Erro', uploadResult.error);
                    setLoading(false);
                    return;
                }
            }

            // Criar item no Firestore
            const result = await createItem({
                name,
                description,
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
            console.error('Erro completo no cadastro:', error);
            Alert.alert('Erro', 'Ocorreu um erro inesperado: ' + error.message);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={globalStyles.container}>
                <Text style={globalStyles.title}>Cadastrar Item</Text>

                {/* Campo Nome */}
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Nome do Item *</Text>
                <TextInput
                    style={globalStyles.input}
                    placeholder="Ex: Chave de Fenda, Parafuso, etc."
                    placeholderTextColor={colors.gray}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                />

                {/* Campo Descrição */}
                <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Descrição</Text>
                <TextInput
                    style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Descrição opcional do item..."
                    placeholderTextColor={colors.gray}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    editable={!loading}
                />

                {/* Upload de Imagem */}
                <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Foto do Item</Text>

                {image && (
                    <Image
                        source={{ uri: image }}
                        style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 15, borderRadius: 10 }}
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
                        <Text style={globalStyles.buttonText}>Cadastrar Item</Text>
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
                    onPress={() => navigation.navigate('ItemList')}
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

export default ItemFormScreen;