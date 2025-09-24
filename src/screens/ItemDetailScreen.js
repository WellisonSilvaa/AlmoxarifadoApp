import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getItemById } from '../services/itemService';
import { getImageUrl } from '../utils/storageUtils';
import { deleteItem } from '../services/itemService';
import { useFocusEffect } from '@react-navigation/native';

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [itemId])
  );

  const loadItem = async () => {
    try {
      const result = await getItemById(itemId);

      if (result.success) {
        setItem(result.data);
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando item...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Item não encontrado</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // FUNÇÃO PARA EXCLUSÃO
  const handleDeleteItem = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteItem(item.id);

              if (result.success) {
                Alert.alert("Sucesso", result.message, [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack()
                  }
                ]);
              } else {
                Alert.alert("Erro", result.error);
              }
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o item");
            }
          }
        }
      ]
    );
  };



  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      {/* Cabeçalho */}
      <Text style={globalStyles.title}>Detalhes do Item</Text>

      {/* Imagem do Item */}
      {item.photoUrl && (
        <Image
          source={{ uri: getImageUrl(item.photoUrl) }}
          style={{
            width: '100%',
            height: 250,
            borderRadius: 12,
            marginBottom: 20,
            backgroundColor: colors.light
          }}
          resizeMode="contain"
        />
      )}

      {/* Informações do Item */}
      <View style={globalStyles.card}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.dark,
          marginBottom: 15
        }}>
          {item.name}
        </Text>

        {item.description ? (
          <Text style={{
            fontSize: 16,
            color: colors.dark,
            lineHeight: 24,
            marginBottom: 15
          }}>
            {item.description}
          </Text>
        ) : (
          <Text style={{
            color: colors.gray,
            fontStyle: 'italic',
            marginBottom: 15
          }}>
            Sem descrição
          </Text>
        )}

        {/* Informações Adicionais */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.light,
          paddingTop: 15
        }}>
          <Text style={{ color: colors.gray, marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>ID:</Text> {item.id}
          </Text>

          <Text style={{ color: colors.gray, marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>Cadastrado em:</Text> {' '}
            {item.createdAt ? item.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
          </Text>

          <Text style={{ color: colors.gray, marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>Status:</Text> {' '}
            <Text style={{
              color: item.isActive ? colors.secondary : colors.danger,
              fontWeight: 'bold'
            }}>
              {item.isActive ? 'ATIVO' : 'INATIVO'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: colors.warning }]}
        onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
      >
        <Text style={globalStyles.buttonText}>✏️ Editar Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: colors.danger }]}
        onPress={handleDeleteItem}
      >
        <Text style={globalStyles.buttonText}>🗑️ Excluir Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: colors.secondary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={globalStyles.buttonText}>← Voltar para Lista</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ItemDetailScreen;