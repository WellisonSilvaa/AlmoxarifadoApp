import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { globalStyles, colors, typography } from '../styles/global';
import { getItemsWithStock, getLowStockItems } from '../services/stockService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StockReportScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'low', 'normal'

  const loadStockData = async () => {
    try {
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

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'low') return items.filter(item => item.needsRestock);
    return items.filter(item => !item.needsRestock);
  }, [items, filter]);

  const stats = useMemo(() => {
    const total = items.length;
    const low = lowStockItems.length;
    const attention = items.filter(item => 
      !item.needsRestock && (item.currentStock <= item.minStock * 1.5)
    ).length;
    return { total, low, attention };
  }, [items, lowStockItems]);

  const getStockStatus = (item) => {
    if (item.needsRestock) return { label: 'Crítico', color: colors.error, bg: '#fef2f2' };
    if (item.currentStock <= item.minStock * 1.5) return { label: 'Atenção', color: '#b45309', bg: '#fffbeb' };
    return { label: 'Normal', color: '#15803d', bg: '#f0fdf4' };
  };

  const renderItem = ({ item }) => {
    const status = getStockStatus(item);
    const progress = Math.min((item.currentStock / (item.minStock * 2 || 10)) * 100, 100);

    return (
      <TouchableOpacity 
        style={styles.stockCard}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.stockInfo}>
          <View>
            <Text style={styles.infoLabel}>Disponível</Text>
            <Text style={[styles.infoValue, { color: status.color }]}>
              {item.currentStock} <Text style={styles.infoUnit}>unid.</Text>
            </Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.infoLabel}>Mínimo</Text>
            <Text style={styles.infoValue}>{item.minStock || 0} <Text style={styles.infoUnit}>unid.</Text></Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: status.color }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}% da capacidade ideal</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: colors.secondary, fontFamily: 'Manrope_600SemiBold' }}>Gerando relatórios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatório de Estoque</Text>
          <View style={styles.profileIcon}>
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            {/* Summary Bento Stats */}
            <View style={styles.bentoGrid}>
              <View style={[styles.bentoMain, { backgroundColor: colors.surface }]}>
                <Text style={styles.bentoLabel}>Itens Totais</Text>
                <Text style={styles.bentoValue}>{stats.total}</Text>
                <Text style={styles.bentoSub}>no catálogo</Text>
              </View>
              <View style={styles.bentoColumn}>
                <View style={[styles.bentoSmall, { backgroundColor: '#fef2f2' }]}>
                  <Text style={[styles.bentoLabel, { color: colors.error }]}>Críticos</Text>
                  <Text style={[styles.bentoValueSmall, { color: colors.error }]}>{stats.low}</Text>
                </View>
                <View style={[styles.bentoSmall, { backgroundColor: '#fffbeb' }]}>
                  <Text style={[styles.bentoLabel, { color: '#b45309' }]}>Atenção</Text>
                  <Text style={[styles.bentoValueSmall, { color: '#b45309' }]}>{stats.attention}</Text>
                </View>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'low' && styles.filterPillActive]}
                  onPress={() => setFilter('low')}
                >
                  <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>Críticos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'normal' && styles.filterPillActive]}
                  onPress={() => setFilter('normal')}
                >
                  <Text style={[styles.filterText, filter === 'normal' && styles.filterTextActive]}>Operacionais</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📦</Text>
            <Text style={styles.emptyTitle}>Sem dados para mostrar</Text>
            <Text style={styles.emptySubtitle}>Nenhum item encontrado com o filtro selecionado.</Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
         <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('Movements')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryVariant]}
            style={styles.fabGradient}
          >
            <Text style={{ color: '#fff', fontSize: 24 }}>📥</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingTop: 25,
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
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  bentoMain: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bentoColumn: {
    flex: 1,
    gap: 12,
  },
  bentoSmall: {
    padding: 12,
    borderRadius: 16,
    justifyContent: 'center',
  },
  bentoLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bentoValue: {
    ...typography.headline,
    fontSize: 32,
    color: colors.onSurface,
  },
  bentoValueSmall: {
    ...typography.headline,
    fontSize: 24,
  },
  bentoSub: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.label,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textTransform: 'none',
  },
  filterTextActive: {
    color: '#fff',
  },
  stockCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    ...typography.title,
    fontSize: 18,
    color: colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    ...typography.label,
    fontSize: 10,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  infoLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.headline,
    fontSize: 20,
    color: colors.onSurface,
  },
  infoUnit: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.secondary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.outlineVariant,
  },
  progressContainer: {
    gap: 8,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    gap: 12,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default StockReportScreen;