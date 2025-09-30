import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { createMovement } from '../services/movementService';
import { getItems } from '../services/itemService';
import { getTrucks } from '../services/truckService';
import { auth, db } from '../services/firebase'; // 👈 IMPORTAR db TAMBÉM

// 👇 IMPORTAR AS FUNÇÕES DO FIRESTORE
import { 
  query, 
  collection, 
  where, 
  getDocs 
} from 'firebase/firestore';

const MovementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  // Estados do formulário
  const [movementType, setMovementType] = useState('exit');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [notes, setNotes] = useState('');

  // Listas de dados
  const [items, setItems] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 👇 OBTER USUÁRIO LOGADO
  const currentUser = auth.currentUser;
  const responsible = currentUser?.email || 'Usuário Logado';

  // 👇 FUNÇÃO CORRIGIDA - COM IMPORTS ADICIONADOS
  const loadItemStock = async (itemId) => {
    try {
      const stockQuery = query(
        collection(db, 'movements'),
        where('itemId', '==', itemId),
        where('isActive', '==', true)
      );

      const movementsSnapshot = await getDocs(stockQuery);
      let stock = 0;

      movementsSnapshot.forEach(doc => {
        const movement = doc.data();
        if (movement.type === 'entry') {
          stock += movement.quantity;
        } else if (movement.type === 'exit') {
          stock -= movement.quantity;
        }
      });

      setCurrentStock(stock);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      setCurrentStock(0);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Atualizar quando item for selecionado
  useEffect(() => {
    if (selectedItem) {
      loadItemStock(selectedItem);
    } else {
      setCurrentStock(0);
    }
  }, [selectedItem]);

  const loadInitialData = async () => {
    try {
      const [itemsResult, trucksResult] = await Promise.all([
        getItems(),
        getTrucks()
      ]);

      if (itemsResult.success) setItems(itemsResult.data);
      if (trucksResult.success) setTrucks(trucksResult.data);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoadingData(false);
    }
  };

  

  // Adicionar validação no handleSubmit
  const validateForm = () => {
    if (!selectedItem) {
      Alert.alert('Erro', 'Por favor, selecione um item');
      return false;
    }

    if (!quantity || quantity <= 0) {
      Alert.alert('Erro', 'Por favor, informe uma quantidade válida');
      return false;
    }

    if (!responsible.trim()) {
      Alert.alert('Erro', 'Por favor, informe o responsável');
      return false;
    }

    // Para saídas, validar carreta
    if (movementType === 'exit' && !selectedTruck) {
      Alert.alert('Erro', 'Para saída, a carreta é obrigatória');
      return false;
    }

    // 👇 VALIDAÇÃO DE ESTOQUE NO FRONTEND TAMBÉM
    if (movementType === 'exit' && currentStock < parseInt(quantity)) {
      Alert.alert(
        'Estoque Insuficiente',
        `Não é possível realizar a saída!\n\nEstoque disponível: ${currentStock} unidades\nQuantidade solicitada: ${quantity} unidades\n\nFaltam: ${parseInt(quantity) - currentStock} unidades`,
        [{ text: 'Entendi' }]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Encontrar item selecionado
      const item = items.find(i => i.id === selectedItem);
      if (!item) {
        Alert.alert('Erro', 'Item não encontrado');
        return;
      }

      // Encontrar carreta selecionada (apenas para saída)
      let truck = null;
      if (movementType === 'exit') {
        truck = trucks.find(t => t.id === selectedTruck);
        if (!truck) {
          Alert.alert('Erro', 'Carreta não encontrada');
          return;
        }
      }

      // 👇 CRIAR MOVIMENTAÇÃO SEM FOTO E COM USUÁRIO LOGADO
      const result = await createMovement({
        type: movementType,
        itemId: item.id,
        itemName: item.name,
        quantity: parseInt(quantity),
        truckId: truck?.id || '',
        truckPlate: truck?.plate || '',
        responsible: responsible, // 👈 USUÁRIO LOGADO AUTOMATICAMENTE
        notes: notes.trim(),
        photoUrl: '' // 👈 SEM FOTO
      });

      if (result.success) {
        Alert.alert('Sucesso', result.message, [
          {
            text: 'OK',
            onPress: () => {
              // Limpar formulário
              setSelectedItem('');
              setQuantity('');
              setSelectedTruck('');
              setNotes('');
            }
          }
        ]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>
          {movementType === 'entry' ? '📥 Entrada de Itens' : '📤 Saída de Itens'}
        </Text>

        {/* 👇 MOSTRAR USUÁRIO RESPONSÁVEL */}
        <View style={styles.responsibleInfo}>
          <Text style={styles.responsibleLabel}>Responsável:</Text>
          <Text style={styles.responsibleName}>{responsible}</Text>
        </View>

        {/* Seletor de Tipo */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Tipo de Movimentação *</Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              movementType === 'entry' && styles.typeButtonActive
            ]}
            onPress={() => setMovementType('entry')}
            disabled={loading}
          >
            <Text style={[
              styles.typeButtonText,
              movementType === 'entry' && styles.typeButtonTextActive
            ]}>
              📥 Entrada
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              movementType === 'exit' && styles.typeButtonActive
            ]}
            onPress={() => setMovementType('exit')}
            disabled={loading}
          >
            <Text style={[
              styles.typeButtonText,
              movementType === 'exit' && styles.typeButtonTextActive
            ]}>
              📤 Saída
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seletor de Item */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Item *</Text>
        <ScrollView style={[globalStyles.input, { maxHeight: 120 }]}>
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemOption,
                selectedItem === item.id && styles.itemOptionSelected
              ]}
              onPress={() => setSelectedItem(item.id)}
              disabled={loading}
            >
              <Text style={selectedItem === item.id ? { color: colors.white } : {}}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mostrar estoque atual quando item for selecionado */}
        {selectedItem && (
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Estoque Atual:</Text>
            <Text style={[
              styles.stockValue,
              { color: movementType === 'exit' && currentStock < parseInt(quantity || 0) ? colors.danger : colors.secondary }
            ]}>
              {currentStock} unidades
            </Text>
            {movementType === 'exit' && currentStock < parseInt(quantity || 0) && (
              <Text style={styles.stockWarning}>
                ⚠️ Estoque insuficiente para esta saída
              </Text>
            )}
          </View>
        )}

        {/* Quantidade */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Quantidade *</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Quantidade"
          placeholderTextColor={colors.gray}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          editable={!loading}
        />

        {/* Carreta (apenas para saída) */}
        {movementType === 'exit' && (
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Carreta *</Text>
            <ScrollView style={[globalStyles.input, { maxHeight: 120 }]}>
              {trucks.map(truck => (
                <TouchableOpacity
                  key={truck.id}
                  style={[
                    styles.itemOption,
                    selectedTruck === truck.id && styles.itemOptionSelected
                  ]}
                  onPress={() => setSelectedTruck(truck.id)}
                  disabled={loading}
                >
                  <Text style={selectedTruck === truck.id ? { color: colors.white } : {}}>
                    🚚 {truck.plate} - {truck.brand} {truck.model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Observações */}
        <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 15 }}>Observações (Opcional)</Text>
        <TextInput
          style={[globalStyles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Observações adicionais..."
          placeholderTextColor={colors.gray}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        {/* 👇 REMOVER SEÇÃO DE COMPROVANTE FOTOGRÁFICO */}

        {/* Botões */}
        <TouchableOpacity
          style={[globalStyles.button, loading && { backgroundColor: colors.gray }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>
              💾 Registrar {movementType === 'entry' ? 'Entrada' : 'Saída'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={{
          marginTop: 20,
          color: colors.gray,
          fontSize: 12,
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          * Movimentação registrada automaticamente por {responsible}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = {
  responsibleInfo: {
    backgroundColor: colors.light,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center'
  },
  responsibleLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2
  },
  responsibleName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary
  },
  typeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.light,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontWeight: 'bold',
    color: colors.dark,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  itemOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  itemOptionSelected: {
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  stockInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.light,
  padding: 10,
  borderRadius: 8,
  marginBottom: 15,
},
stockLabel: {
  fontWeight: 'bold',
  marginRight: 5,
  color: colors.dark,
},
stockValue: {
  fontWeight: 'bold',
  fontSize: 16,
},
stockWarning: {
  color: colors.danger,
  fontSize: 12,
  marginLeft: 'auto',
  fontWeight: 'bold',
}
};

export default MovementScreen;