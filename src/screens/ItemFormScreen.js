import React, { useState } from 'react';
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
import { colors, typography } from '../styles/global';
import { createItem } from '../services/itemService';
import { uploadImage } from '../utils/storageUtils';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../context/DataContext';

const ItemFormScreen = ({ navigation }) => {
    const { refreshData } = useData();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [minStock, setMinStock] = useState('5');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

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
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
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
                Alert.alert('Permissão necessária', 'Precisamos acesso à sua câmera.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível abrir a câmera.');
        }
    };

    const handleImagePress = () => {
        Alert.alert(
            'Foto do Produto',
            'Como deseja adicionar a imagem?',
            [
                { text: '📷 Tirar Foto', onPress: takePhoto },
                { text: '📁 Galeria', onPress: pickImage },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'O nome do item é obrigatório.');
            return;
        }

        setLoading(true);
        let photoUrl = '';

        try {
            if (image) {
                setUploading(true);
                const uploadResult = await uploadImage(image, 'items/');
                setUploading(false);
                if (uploadResult.success) {
                    photoUrl = uploadResult.url;
                } else {
                    Alert.alert('Erro no Upload', uploadResult.error);
                    setLoading(false);
                    return;
                }
            }

            const result = await createItem({
                name,
                description,
                minStock: parseInt(minStock) || 0,
                photoUrl
            });

            if (result.success) {
                // 👇 Atualizar dados globais após cadastrar novo item
                await refreshData();
                
                Alert.alert('Sucesso', 'Item cadastrado com sucesso!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Erro', result.error);
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />
            
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={{ fontSize: 20 }}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Novo Item</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Image Section */}
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
                            <Text style={styles.placeholderIcon}>📸</Text>
                            <Text style={styles.placeholderLabel}>Adicionar Foto do Produto</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome do Item *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Alicate de Pressão"
                            placeholderTextColor={colors.secondary + '60'}
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição Detalhada</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Opcional: Dimensões, Marca, Material..."
                            placeholderTextColor={colors.secondary + '60'}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estoque Mínimo (Alerta)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="5"
                            placeholderTextColor={colors.secondary + '60'}
                            value={minStock}
                            onChangeText={setMinStock}
                            keyboardType="numeric"
                            editable={!loading}
                        />
                        <Text style={styles.inputHint}>O sistema alertará quando restarem menos unidades.</Text>
                    </View>
                </View>

                {/* Submit Section */}
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
                                <Text style={styles.buttonText}>Cadastrar Item no Estoque</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    {uploading && (
                        <Text style={styles.uploadText}>Sincronizando imagem...</Text>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceVariant,
        paddingTop: 25,
        height: 80,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        ...typography.headline,
        fontSize: 18,
        color: colors.primary,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageSelector: {
        height: 240,
        backgroundColor: colors.surfaceContainerLow,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    placeholderLabel: {
        ...typography.body,
        color: colors.secondary,
        fontSize: 14,
    },
    formContainer: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        ...typography.label,
        fontSize: 13,
        color: colors.onSurface,
        marginBottom: 8,
        paddingLeft: 4,
    },
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
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    inputHint: {
        ...typography.body,
        fontSize: 12,
        color: colors.secondary,
        marginTop: 6,
        paddingLeft: 4,
    },
    footer: {
        paddingHorizontal: 24,
        marginTop: 16,
    },
    gradientButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        ...typography.label,
        fontSize: 16,
        color: '#fff',
        textTransform: 'none',
    },
    uploadText: {
        textAlign: 'center',
        color: colors.secondary,
        fontSize: 12,
        marginTop: 8,
    },
    cancelButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    cancelText: {
        ...typography.label,
        fontSize: 16,
        color: colors.secondary,
        textTransform: 'none',
    },
});

export default ItemFormScreen;