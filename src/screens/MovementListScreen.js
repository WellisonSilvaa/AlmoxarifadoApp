import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getMovements } from '../services/movementService';
import LicensePlate from '../components/LicensePlate';

const MovementListScreen = ({ navigation }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'entry', 'exit'

  const loadMovements = async () => {
    try {
      console.log('Carregando movimentações...');
      const result = await getMovements();
      
      console.log('Resultado da busca:', result);
      
      if (result.success) {
        console.log('Movimentações encontradas:', result.data.length);
        setMovements(result.data);
      } else {
        console.log('Erro ao carregar movimentações:', result.error);
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      console.error('Erro completo na loadMovements:', error);
      Alert.alert('Erro', 'Não foi possível carregar as movimentações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMovements();
  };

  // Filtrar movimentações
  const filteredMovements = filter === 'all' 
    ? movements 
    : movements.filter(movement => movement.type === filter);

  const getMovementIcon = (type) => {
    return type === 'entry' ? '📥' : '📤';
  };

  const getMovementColor = (type) => {
    return type === 'entry' ? colors.secondary : colors.primary;
  };

  const getMovementTypeText = (type) => {
    return type === 'entry' ? 'ENTRADA' : 'SAÍDA';
  };

  const renderMovement = ({ item }) => (
    <TouchableOpacity 
      style={[
        globalStyles.card, 
        { borderLeftWidth: 4, borderLeftColor: getMovementColor(item.type) }
      ]}
      onPress={() => navigation.navigate('MovementDetail', { movementId: item.id })}
    >
      {/* Cabeçalho com Tipo e Data */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={[styles.typeText, { color: getMovementColor(item.type) }]}>
            {getMovementIcon(item.type)} {getMovementTypeText(item.type)}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {item.date ? item.date.toLocaleDateString('pt-BR') : 'N/A'}
        </Text>
      </View>

      {/* Item e Quantidade */}
      <View style={styles.itemSection}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.quantity}>
          Quantidade: <Text style={styles.quantityNumber}>{item.quantity}</Text>
        </Text>
      </View>

      {/* Carreta (apenas para saídas) */}
      {item.type === 'exit' && item.truckPlate && (
        <View style={styles.truckSection}>
          <Text style={styles.truckLabel}>Carreta:</Text>
          <LicensePlate plate={item.truckPlate} size="small" />
        </View>
      )}

      {/* Responsável */}
      <View style={styles.responsibleSection}>
        <Text style={styles.responsibleLabel}>Responsável:</Text>
        <Text style={styles.responsibleName}>{item.responsible}</Text>
      </View>

      {/* Observações (se existir) */}
      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Observações:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {/* Horário */}
      <Text style={styles.timeText}>
        {item.date ? item.date.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando movimentações...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Histórico de Movimentações</Text>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              📋 Todas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'entry' && styles.filterButtonActive]}
            onPress={() => setFilter('entry')}
          >
            <Text style={[styles.filterText, filter === 'entry' && styles.filterTextActive]}>
              📥 Entradas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'exit' && styles.filterButtonActive]}
            onPress={() => setFilter('exit')}
          >
            <Text style={[styles.filterText, filter === 'exit' && styles.filterTextActive]}>
              📤 Saídas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contador */}
      <Text style={styles.counterText}>
        Mostrando {filteredMovements.length} de {movements.length} movimentações
      </Text>

      <FlatList
        data={filteredMovements}
        renderItem={renderMovement}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhuma movimentação encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Registre a primeira movimentação!' 
                : `Nenhuma ${filter === 'entry' ? 'entrada' : 'saída'} encontrada`
              }
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={globalStyles.button}
        onPress={() => navigation.navigate('Movements')}
      >
        <Text style={globalStyles.buttonText}>➕ Nova Movimentação</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: colors.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  dateText: {
    color: colors.gray,
    fontSize: 12,
  },
  itemSection: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4,
  },
  quantity: {
    color: colors.gray,
    fontSize: 14,
  },
  quantityNumber: {
    fontWeight: 'bold',
    color: colors.dark,
  },
  truckSection: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  truckLabel: {
    color: colors.gray,
    fontSize: 12,
    marginBottom: 4,
  },
  responsibleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responsibleLabel: {
    color: colors.gray,
    fontSize: 12,
    marginRight: 5,
  },
  responsibleName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.dark,
  },
  notesSection: {
    backgroundColor: colors.light,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  notesLabel: {
    color: colors.gray,
    fontSize: 11,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: colors.dark,
  },
  timeText: {
    color: colors.gray,
    fontSize: 10,
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.dark,
  },
  filterButton: {
    backgroundColor: colors.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.dark,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  counterText: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 15,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
};

export default MovementListScreen;