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
import { getMovements } from '../services/movementService';
import LicensePlate from '../components/LicensePlate';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MovementListScreen = ({ navigation }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'entry', 'exit'

  const loadMovements = async () => {
    try {
      const result = await getMovements();
      if (result.success) {
        setMovements(result.data);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
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

  const filteredMovements = useMemo(() => {
    return filter === 'all' 
      ? movements 
      : movements.filter(m => m.type === filter);
  }, [movements, filter]);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    const todayMovements = movements.filter(m => 
      (m.date?.toLocaleDateString ? m.date.toLocaleDateString('pt-BR') : '') === today
    );
    
    return {
      entries: todayMovements.filter(m => m.type === 'entry').length,
      exits: todayMovements.filter(m => m.type === 'exit').length,
    };
  }, [movements]);

  const renderMovement = ({ item }) => (
    <TouchableOpacity 
      style={styles.movementCard}
      onPress={() => navigation.navigate('MovementDetail', { movementId: item.id })}
    >
      <View style={styles.cardRow}>
        <View style={[
          styles.typeIcon, 
          { backgroundColor: item.type === 'entry' ? '#f0fdf4' : '#fff1f2' }
        ]}>
          <Text style={{ fontSize: 18 }}>{item.type === 'entry' ? '📥' : '📤'}</Text>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
          <Text style={styles.responsible}>{item.responsible || 'Sistema'}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={[
            styles.quantityText, 
            { color: item.type === 'entry' ? '#15803d' : colors.error }
          ]}>
            {item.type === 'entry' ? '+' : '-'}{item.quantity}
          </Text>
          <Text style={styles.timeText}>
            {item.date ? item.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </Text>
        </View>
      </View>

      {item.type === 'exit' && item.truckPlate && (
        <View style={styles.truckBadge}>
          <Text style={styles.truckLabel}>Logística:</Text>
          <LicensePlate plate={item.truckPlate} size="small" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: colors.secondary, fontFamily: 'Manrope_600SemiBold' }}>Sincronizando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Fluxo</Text>
          <View style={styles.profileIcon}>
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredMovements}
        renderItem={renderMovement}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            {/* Stats Summary Bento */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Entradas Hoje</Text>
                <Text style={[styles.statValue, { color: '#15803d' }]}>{stats.entries}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Saídas Hoje</Text>
                <Text style={[styles.statValue, { color: colors.error }]}>{stats.exits}</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'entry' && styles.filterPillActive]}
                  onPress={() => setFilter('entry')}
                >
                  <Text style={[styles.filterText, filter === 'entry' && styles.filterTextActive]}>Entradas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'exit' && styles.filterPillActive]}
                  onPress={() => setFilter('exit')}
                >
                  <Text style={[styles.filterText, filter === 'exit' && styles.filterTextActive]}>Saídas</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={styles.emptyTitle}>Sem registros</Text>
            <Text style={styles.emptySubtitle}>
              Nenhuma movimentação encontrada para o filtro selecionado.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Movements')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          style={styles.fabGradient}
        >
          <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    ...typography.headline,
    fontSize: 28,
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
  movementCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.title,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 2,
  },
  responsible: {
    ...typography.body,
    fontSize: 12,
    color: colors.secondary,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  quantityText: {
    ...typography.title,
    fontSize: 17,
  },
  timeText: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 8,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  truckLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.secondary,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
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
  }
});

export default MovementListScreen;