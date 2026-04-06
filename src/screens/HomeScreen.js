// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { globalStyles, colors, typography } from '../styles/global';
import { auth } from '../services/firebase';
import { logoutUser, checkIsAdmin } from '../services/authService';
import { getItems } from '../services/itemService';
import { getTrucks } from '../services/truckService';
import { getMovements } from '../services/movementService';
import { getLowStockItems } from '../services/stockService';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    itemsCount: 0,
    trucksCount: 0,
    movementsCount: 0,
    lowStockCount: 0,
    recentMovements: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const user = auth.currentUser;

  const loadStats = async () => {
    try {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);

      const [itemsResult, trucksResult, movementsResult, lowStockResult] = await Promise.all([
        getItems(),
        getTrucks(),
        getMovements(),
        getLowStockItems()
      ]);

      const items = itemsResult.success ? itemsResult.data : [];
      const trucks = trucksResult.success ? trucksResult.data : [];
      const movements = movementsResult.success ? movementsResult.data : [];
      const lowStockItems = lowStockResult.success ? lowStockResult.data : [];

      // Sort movements by date descending if they have a date
      const sortedMovements = movements.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

      setStats({
        itemsCount: items.length,
        trucksCount: trucks.length,
        movementsCount: movements.length,
        lowStockCount: lowStockItems.length,
        recentMovements: sortedMovements.slice(0, 3)
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair do sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          onPress: async () => {
            const result = await logoutUser();
            if (result.success) navigation.replace('Login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 15, color: colors.secondary, fontFamily: 'Manrope_600SemiBold' }}>Sincronizando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* TopAppBar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => Alert.alert('Menu', 'Funcionalidade de navegação rápida em breve.')}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.brandText}>Almoxarifado Pro</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.profileIcon}>
              <Text style={{ fontSize: 14 }}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Hero */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primaryVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>BOM DIA, {user?.displayName?.toUpperCase() || 'USUÁRIO'}</Text>
              <Text style={styles.heroTitle}>Visão Geral das{"\n"}Operações</Text>
              <Text style={styles.heroSubtitle}>
                Monitore o estoque e a logística em tempo real. A eficiência está a um clique.
              </Text>
            </View>
            <View style={styles.heroDeco} />
          </LinearGradient>
        </View>

        {/* Bento Stats Grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoRow}>
            <TouchableOpacity 
              style={styles.bentoItem}
              onPress={() => navigation.navigate('ItemList')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#e7f0ff' }]}>
                <Text style={{ fontSize: 20 }}>📦</Text>
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>Itens em Estoque</Text>
                <Text style={styles.bentoValue}>{stats.itemsCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.bentoItem}
              onPress={() => navigation.navigate('TruckList')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#fff0f0' }]}>
                <Text style={{ fontSize: 20 }}>🚚</Text>
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>Carretas Ativas</Text>
                <Text style={styles.bentoValue}>{stats.trucksCount}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoRow}>
            <TouchableOpacity 
              style={styles.bentoItem}
              onPress={() => navigation.navigate('MovementList')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                <Text style={{ fontSize: 20 }}>🔄</Text>
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>Movimentações</Text>
                <Text style={styles.bentoValue}>{stats.movementsCount}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bentoItem, stats.lowStockCount > 0 && styles.bentoItemAlert]}
              onPress={() => navigation.navigate('StockReport')}
            >
              <View style={[styles.iconBox, { backgroundColor: stats.lowStockCount > 0 ? '#fef2f2' : '#f8f9fa' }]}>
                <Text style={{ fontSize: 20 }}>⚠️</Text>
              </View>
              <View style={styles.bentoContent}>
                <Text style={styles.bentoLabel}>Estoque Baixo</Text>
                <Text style={[styles.bentoValue, stats.lowStockCount > 0 && { color: colors.error }]}>
                  {stats.lowStockCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Movements Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimentações Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MovementList')}>
            <Text style={styles.viewAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {stats.recentMovements.length > 0 ? (
            stats.recentMovements.map((item, index) => (
              <TouchableOpacity 
                key={item.id || index} 
                style={styles.movementItem}
                onPress={() => navigation.navigate('MovementDetail', { movementId: item.id })}
              >
                <View style={[
                  styles.movementIcon, 
                  { backgroundColor: item.type === 'entry' ? '#f0fdf4' : '#fef2f2' }
                ]}>
                  <Text style={{ fontSize: 16 }}>{item.type === 'entry' ? '📥' : '📤'}</Text>
                </View>
                <View style={styles.movementInfo}>
                  <Text style={styles.movementName} numberOfLines={1}>
                    {item.type === 'entry' ? 'Entrada' : 'Saída'}: {item.itemName}
                  </Text>
                  <Text style={styles.movementMeta}>{item.employeeName || 'Almoxarifado'}</Text>
                </View>
                <View style={styles.movementRight}>
                  <Text style={[
                    styles.movementQty, 
                    { color: item.type === 'entry' ? '#15803d' : '#b91c1c' }
                  ]}>
                    {item.type === 'entry' ? '+' : '-'}{item.quantity}
                  </Text>
                  <Text style={styles.movementTime}>
                    {item.date?.toDate ? item.date.toDate().toLocaleTimeString([], { hour: '2d', minute: '2d' }) : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma movimentação recente</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('ItemForm')}
          >
            <View style={styles.quickActionIcon}><Text style={{ fontSize: 24 }}>➕</Text></View>
            <Text style={styles.quickActionLabel}>Novo Item</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Movements')}
          >
            <View style={styles.quickActionIcon}><Text style={{ fontSize: 24 }}>🔄</Text></View>
            <Text style={styles.quickActionLabel}>Movimentar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('TruckForm')}
          >
            <View style={styles.quickActionIcon}><Text style={{ fontSize: 24 }}>🚚</Text></View>
            <Text style={styles.quickActionLabel}>Nova Carreta</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('StockReport')}
          >
            <View style={styles.quickActionIcon}><Text style={{ fontSize: 24 }}>📊</Text></View>
            <Text style={styles.quickActionLabel}>Relatório</Text>
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <TouchableOpacity 
            style={styles.adminBanner}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.adminBannerText}>Gerenciar Administradores</Text>
            <Text style={styles.adminBannerIcon}>🛡️</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Plus Button (Stitch style) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Movements')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          style={styles.fabGradient}
        >
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>⇅</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 80,
    paddingTop: 25,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    zIndex: 100,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  brandText: {
    ...typography.headline,
    fontSize: 18,
    color: colors.primary,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  heroWrapper: {
    padding: 20,
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    height: 180,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    zIndex: 10,
  },
  heroLabel: {
    ...typography.label,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  heroTitle: {
    ...typography.headline,
    fontSize: 26,
    color: '#ffffff',
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '70%',
    lineHeight: 18,
  },
  heroDeco: {
    position: 'absolute',
    right: -20,
    top: 0,
    width: width * 0.35,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ skewX: '-15deg' }],
  },
  bentoGrid: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bentoItemAlert: {
    backgroundColor: '#fffcfc',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoContent: {
    gap: 2,
  },
  bentoLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.secondary,
    textTransform: 'none',
  },
  bentoValue: {
    ...typography.headline,
    fontSize: 24,
    color: colors.onSurface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.onSurface,
  },
  viewAll: {
    ...typography.label,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'none',
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  movementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movementInfo: {
    flex: 1,
  },
  movementName: {
    ...typography.title,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 2,
  },
  movementMeta: {
    ...typography.body,
    fontSize: 12,
    color: colors.secondary,
  },
  movementRight: {
    alignItems: 'flex-end',
  },
  movementQty: {
    ...typography.title,
    fontSize: 16,
  },
  movementTime: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAction: {
    width: (width - 52) / 2,
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.onSurface,
    textTransform: 'none',
  },
  adminBanner: {
    margin: 20,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminBannerText: {
    ...typography.title,
    fontSize: 14,
    color: '#fff',
  },
  adminBannerIcon: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 64,
    height: 64,
    borderRadius: 22,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default HomeScreen;