
// src/screens/TruckListScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { LinearGradient } from 'expo-linear-gradient';
import LicensePlate from '../components/LicensePlate';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Adicionado ícones
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const TruckListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { trucks, loading, refreshData } = useData(); // 👈 Consumindo do context
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredTrucks = useMemo(() => {
    return trucks.filter(truck => 
      truck.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (truck.model && truck.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (truck.brand && truck.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [trucks, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: trucks.length,
      available: trucks.filter(t => t.isActive).length,
    };
  }, [trucks]);

  const renderTruck = ({ item }) => (
    <TouchableOpacity 
      style={styles.truckCard}
      onPress={() => navigation.navigate('TruckDetail', { truckId: item.id })}
    >
      <View style={styles.cardHeader}>
        <LicensePlate plate={item.plate} size="small" />
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.isActive ? '#f0fdf4' : '#fff1f2' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: item.isActive ? '#15803d' : colors.error }
          ]}>
            {item.isActive ? 'Disponível' : 'Inativa'}
          </Text>
        </View>
      </View>

      <Text style={styles.truckName}>{item.brand} {item.model || 'Sem Modelo'}</Text>
      
      <View style={styles.specsGrid}>
        <View style={styles.specItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.secondary} />
          <Text style={styles.specLabel}>{item.year || '--'}</Text>
        </View>
        <View style={styles.specItem}>
          <Ionicons name="scale-outline" size={16} color={colors.secondary} />
          <Text style={styles.specLabel}>{item.capacity || 'N/A'}</Text>
        </View>
        <View style={styles.specItem}>
          <MaterialCommunityIcons name="package-variant-closed" size={16} color={colors.secondary} />
          <Text style={styles.specLabel}>Vazia</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>
          Adicionada em {item.createdAt ? item.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
        </Text>
        <Text style={styles.viewDetails}>Ver Detalhes →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && trucks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Sincronizando frota...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestão de Frota</Text>
          <View style={styles.profileIcon}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredTrucks}
        renderItem={renderTruck}
        keyExtractor={item => item.id}
        contentContainerStyle={[
            styles.listContent, 
            { paddingBottom: 100 + insets.bottom }
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={20} color={colors.secondary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por placa ou modelo..."
                  placeholderTextColor={colors.secondary + '80'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <View style={styles.bentoStats}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total de Carretas</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statSub}>cadastradas</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderWidth: 0 }]}>
                <Text style={[styles.statLabel, { color: '#15803d' }]}>Em Operação</Text>
                <Text style={[styles.statValue, { color: '#15803d' }]}>{stats.available}</Text>
                <Text style={[styles.statSub, { color: 'rgba(21,128,61,0.7)' }]}>status ativo</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={60} color={colors.secondary} opacity={0.3} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhuma carreta corresponde à busca.' : 'Nenhuma carreta cadastrada ainda.'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[
            styles.fab,
            { bottom: 30 + insets.bottom }
        ]} 
        onPress={() => navigation.navigate('TruckForm')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 15,
    color: colors.secondary,
    fontFamily: 'Manrope_600SemiBold',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
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
  backIconText: {
    fontSize: 20,
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
  profileEmoji: {
    fontSize: 14,
  },
  listContent: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  bentoStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 8,
  },
  statValue: {
    ...typography.headline,
    fontSize: 32,
    color: colors.onSurface,
  },
  statSub: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
  },
  truckCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.label,
    fontSize: 11,
  },
  truckName: {
    ...typography.title,
    fontSize: 20,
    color: colors.onSurface,
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    gap: 16,
    marginBottom: 16,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  specIcon: {
    fontSize: 18,
  },
  specLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: 12,
  },
  footerDate: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
  },
  viewDetails: {
    ...typography.label,
    fontSize: 11,
    color: colors.primary,
    textTransform: 'none',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
  }
});

export default TruckListScreen;
