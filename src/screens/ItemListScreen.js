import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    RefreshControl
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getItems } from '../services/itemService';
import { getImageUrl } from '../utils/storageUtils';
import { useFocusEffect } from '@react-navigation/native';

const ItemListScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    const loadItems = async () => {
        try {
            console.log('Carregando itens...');
            const result = await getItems();

            console.log('Resultado da busca:', result);

            if (result.success) {
                console.log('Itens encontrados:', result.data.length);
                setItems(result.data);
            } else {
                console.log('Erro ao carregar itens:', result.error);
                Alert.alert('Erro', result.error);
            }
        } catch (error) {
            console.error('Erro completo na loadItems:', error);
            Alert.alert('Erro', 'Não foi possível carregar os itens');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [])
    );

    // useEffect(() => {
    //     loadItems();
    // }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadItems();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={globalStyles.card}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
        >
            {/* Imagem do Item */}
            {item.photoUrl && (
                <Image
                    source={{ uri: getImageUrl(item.photoUrl) }}
                    style={{
                        width: '100%',
                        height: 150,
                        borderRadius: 8,
                        marginBottom: 10
                    }}
                    resizeMode="cover"
                />
            )}

            {/* Informações do Item */}
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>
                {item.name}
            </Text>

            {item.description ? (
                <Text style={{ color: colors.dark, marginBottom: 5 }}>
                    {item.description.length > 50
                        ? item.description.substring(0, 50) + '...'
                        : item.description
                    }
                </Text>
            ) : (
                <Text style={{ color: colors.gray, fontStyle: 'italic' }}>
                    Sem descrição
                </Text>
            )}

            <Text style={{ color: colors.dark, fontSize: 12 }}>
                Cadastrado em: {item.createdAt
                    ? item.createdAt.toLocaleDateString('pt-BR')
                    : 'Data não disponível'
                }
            </Text>

            {/* Status */}
            <Text style={{
                color: item.isActive ? colors.secondary : colors.danger,
                fontWeight: 'bold',
                marginTop: 5,
                marginBottom: 20
            }}>
                {item.isActive ? 'ATIVO' : 'INATIVO'}
            </Text>
            
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10 }}>Carregando itens...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Itens Cadastrados</Text>

            <Text style={{
                marginBottom: 20,
                color: colors.dark,
                textAlign: 'center'
            }}>
                Total: {items.length} itens
            </Text>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ color: colors.gray, fontSize: 16 }}>
                            Nenhum item cadastrado ainda.
                        </Text>
                        <Text style={{ color: colors.gray, marginTop: 10 }}>
                            Clique no botão abaixo para cadastrar o primeiro item!
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[globalStyles.button, { marginBottom: 50 }]}
                onPress={() => navigation.navigate('ItemForm')}
            >
                <Text style={globalStyles.buttonText}>➕ Novo Item</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ItemListScreen;