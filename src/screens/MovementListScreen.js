
// src/screens/MovementListScreen.js
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 Adicionado useSafeAreaInsets
import { colors, typography } from '../styles/global';
import LicensePlate from '../components/LicensePlate';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const MovementListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // 👈 Obtendo insets
  const { movements: contextMovements, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'entry', 'exit'

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const movements = contextMovements;

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
          <Text style={styles.emojiText}>{item.type === 'entry' ? '📥' : '📤'}</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIconText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Fluxo</Text>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredMovements}
        renderItem={renderMovement}
        keyExtractor={item => item.id}
        contentContainerStyle={[
            styles.listContent, 
            { paddingBottom: 100 + insets.bottom } // 👈 Ajuste dinâmico
        ]}
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
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Sem registros</Text>
            <Text style={styles.emptySubtitle}>
              Nenhuma movimentação encontrada para o filtro selecionado.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[
            styles.fab,
            { bottom: 30 + insets.bottom } // 👈 Posicionamento inteligente
        ]} 
        onPress={() => navigation.navigate('Movements')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
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
    // paddingBottom agora é dinâmico
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
  emojiText: {
    fontSize: 18,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
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

export default MovementListScreen;
