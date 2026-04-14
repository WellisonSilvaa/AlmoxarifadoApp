
// src/screens/StockReportScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // 👈 Adicionado Ionicons
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const StockReportScreen = ({ navigation }) => {
  const { items, loading, refreshData } = useData();
  const [filter, setFilter] = useState('all'); // all, low, normal

  const filteredItems = items.filter(item => {
    if (filter === 'low') return item.needsRestock;
    if (filter === 'normal') return !item.needsRestock;
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category || 'Sem categoria'}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.needsRestock ? '#fff1f2' : '#f0fdf4' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.needsRestock ? colors.error : '#15803d' }
          ]}>
            {item.needsRestock ? 'Reposição' : 'OK'}
          </Text>
        </View>
      </View>

      <View style={styles.stockDetails}>
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>Estoque Atual</Text>
          <Text style={[
            styles.stockValue,
            item.needsRestock && { color: colors.error }
          ]}>
            {item.currentStock} {item.unit || 'un'}
          </Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockLabel}>Mínimo</Text>
          <Text style={styles.stockValue}>{item.minStock} {item.unit || 'un'}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill, 
            { 
              width: `${Math.min((item.currentStock / (item.minStock * 2)) * 100, 100)}%`,
              backgroundColor: item.needsRestock ? colors.error : colors.primary
            }
          ]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório de Estoque</Text>
        <TouchableOpacity onPress={() => refreshData()} style={styles.refreshButton}>
          <Ionicons name="sync-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'low' && styles.filterChipActive, filter === 'low' && { borderColor: colors.error }]}
          onPress={() => setFilter('low')}
        >
          <Text style={[styles.filterText, filter === 'low' && { color: colors.error }, filter === 'low' && styles.filterTextActive]}>Críticos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'normal' && styles.filterChipActive]}
          onPress={() => setFilter('normal')}
        >
          <Text style={[styles.filterText, filter === 'normal' && styles.filterTextActive]}>Estáveis</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 18,
    color: colors.primary,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.label,
    fontSize: 12,
    color: colors.secondary,
    textTransform: 'none',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemName: {
    ...typography.title,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 4,
  },
  itemCategory: {
    ...typography.body,
    fontSize: 12,
    color: colors.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    ...typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  stockDetails: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    gap: 24,
    marginBottom: 16,
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  stockValue: {
    ...typography.headline,
    fontSize: 20,
    color: colors.onSurface,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.outlineVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  }
});

export default StockReportScreen;
