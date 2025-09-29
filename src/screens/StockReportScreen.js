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
import { getItemsWithStock, getLowStockItems } from '../services/stockService';

const StockReportScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'normal'

  const loadStockData = async () => {
    try {
      console.log('Carregando dados de estoque...');
      
      const [allItemsResult, lowStockResult] = await Promise.all([
        getItemsWithStock(),
        getLowStockItems()
      ]);

      if (allItemsResult.success) {
        setItems(allItemsResult.data);
      } else {
        Alert.alert('Erro', allItemsResult.error);
      }

      if (lowStockResult.success) {
        setLowStockItems(lowStockResult.data);
      }

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados de estoque');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStockData();
  };

  // Filtrar itens
  const filteredItems = filter === 'all' 
    ? items 
    : filter === 'low' 
    ? items.filter(item => item.needsRestock)
    : items.filter(item => !item.needsRestock);

  const getStockColor = (item) => {
    if (item.needsRestock) {
      return colors.danger; // Vermelho para estoque baixo
    } else if (item.currentStock <= (item.minStock * 1.5)) {
      return colors.warning; // Amarelo para estoque próximo do mínimo
    } else {
      return colors.secondary; // Verde para estoque normal
    }
  };

  const getStockStatus = (item) => {
    if (item.needsRestock) {
      return 'ESTOQUE BAIXO';
    } else if (item.currentStock <= (item.minStock * 1.5)) {
      return 'ATENÇÃO';
    } else {
      return 'NORMAL';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        globalStyles.card, 
        { 
          borderLeftWidth: 4, 
          borderLeftColor: getStockColor(item),
          opacity: item.needsRestock ? 1 : 0.9
        }
      ]}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      {/* Nome do Item */}
      <Text style={styles.itemName}>{item.name}</Text>
      
      {/* Estoque Atual */}
      <View style={styles.stockSection}>
        <Text style={styles.stockLabel}>Estoque Atual:</Text>
        <Text style={[styles.stockValue, { color: getStockColor(item) }]}>
          {item.currentStock} unidades
        </Text>
      </View>

      {/* Estoque Mínimo */}
      <View style={styles.minStockSection}>
        <Text style={styles.minStockLabel}>Estoque Mínimo:</Text>
        <Text style={styles.minStockValue}>{item.minStock || 0} unidades</Text>
      </View>

      {/* Barra de Progresso Visual */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${Math.min((item.currentStock / (item.minStock || 1)) * 100, 100)}%`,
              backgroundColor: getStockColor(item)
            }
          ]} 
        />
      </View>

      {/* Status */}
      <View style={styles.statusSection}>
        <Text style={[styles.statusText, { color: getStockColor(item) }]}>
          {getStockStatus(item)}
        </Text>
        {item.needsRestock && (
          <Text style={styles.alertText}>⚠️ Necessita reposição</Text>
        )}
      </View>

      {/* Descrição (se existir) */}
      {item.description && (
        <Text style={styles.descriptionText}>
          {item.description.length > 60 
            ? item.description.substring(0, 60) + '...' 
            : item.description
          }
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Calculando estoques...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Relatório de Estoque</Text>

      {/* Resumo */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{items.length}</Text>
          <Text style={styles.summaryLabel}>Itens Totais</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.danger }]}>
            {lowStockItems.length}
          </Text>
          <Text style={styles.summaryLabel}>Estoque Baixo</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.warning }]}>
            {items.filter(item => item.currentStock <= (item.minStock * 1.5) && !item.needsRestock).length}
          </Text>
          <Text style={styles.summaryLabel}>Atenção</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              📋 Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'low' && styles.filterButtonActive]}
            onPress={() => setFilter('low')}
          >
            <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>
              🔴 Estoque Baixo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'normal' && styles.filterButtonActive]}
            onPress={() => setFilter('normal')}
          >
            <Text style={[styles.filterText, filter === 'normal' && styles.filterTextActive]}>
              🟢 Normal
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contador */}
      <Text style={styles.counterText}>
        Mostrando {filteredItems.length} de {items.length} itens
      </Text>

      <FlatList
        data={filteredItems}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📦</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all' 
                ? 'Nenhum item cadastrado' 
                : filter === 'low'
                ? 'Nenhum item com estoque baixo'
                : 'Todos os itens estão com estoque baixo'
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Cadastre o primeiro item!' 
                : filter === 'low'
                ? 'Ótimo! Todos os itens estão com estoque adequado'
                : 'Todos os itens necessitam de reposição'
              }
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={globalStyles.button}
        onPress={() => navigation.navigate('ItemForm')}
      >
        <Text style={globalStyles.buttonText}>➕ Novo Item</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[globalStyles.button, { backgroundColor: colors.secondary, marginTop: 10 }]}
        onPress={() => navigation.navigate('Movements')}
      >
        <Text style={globalStyles.buttonText}>📥 Nova Movimentação</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 10,
  },
  stockSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stockLabel: {
    color: colors.gray,
    fontSize: 14,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  minStockSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  minStockLabel: {
    color: colors.gray,
    fontSize: 12,
  },
  minStockValue: {
    fontSize: 12,
    color: colors.gray,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.light,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: 'bold',
  },
  descriptionText: {
    color: colors.gray,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
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

export default StockReportScreen;