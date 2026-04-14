
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
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 Adicionado useSafeAreaInsets
import { colors, typography } from '../styles/global';
import { logoutUser } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Adicionado MaterialCommunityIcons
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // 👈 Obtendo os insets (espaciamentos seguros)
  const { 
    items, 
    trucks, 
    movements, 
    lowStockItems, 
    isAdmin, 
    refreshData,
    user,
    loading: globalLoading 
  } = useData();

  const [refreshing, setRefreshing] = useState(false);

  // Estatísticas calculadas a partir dos dados do contexto
  const stats = {
    itemsCount: items.length,
    trucksCount: trucks.length,
    movementsCount: movements.length,
    lowStockCount: lowStockItems.length,
    recentMovements: movements.slice(0, 3)
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
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

  const getUserDisplayName = () => {
      if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
      // if (user?.email) return user.email.split('@')[0].toUpperCase();
      return 'USUÁRIO';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* TopAppBar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => Alert.alert('Informação', 'Almoxarifado App v1.0.0')}
          >
            <Image 
              source={require('../../assets/icon.png')} 
              style={{ width: 40, height: 40, transform: [{ scale: 3.0 }] }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.brandText}>Almoxarifado Pro</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.profileIcon}>
              <Ionicons name="log-out-outline" size={22} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + insets.bottom } // 👈 Ajuste dinâmico do final da lista
        ]}
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
              <Text style={styles.heroLabel}>Bem Vindo, {getUserDisplayName()}</Text>
              <Text style={styles.heroTitle}>Visão Geral das{"\n"}Operações</Text>
              <Text style={styles.heroSubtitle}>
                Monitore o estoque e a logística em tempo real.
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
                <MaterialCommunityIcons name="package-variant-closed" size={22} color="#0056d2" />
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
                <MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#d32f2f" />
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
                <Ionicons name="sync-outline" size={20} color="#ed8936" />
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
                <Ionicons 
                  name="warning-outline" 
                  size={20} 
                  color={stats.lowStockCount > 0 ? colors.error : colors.secondary} 
                />
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
                  <Ionicons 
                    name={item.type === 'entry' ? 'arrow-down' : 'arrow-up'} 
                    size={20} 
                    color={item.type === 'entry' ? '#15803d' : '#b91c1c'} 
                  />
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
                    {item.date ? new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Novo Item</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Movements')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="repeat-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Movimentar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('TruckForm')}
          >
            <View style={styles.quickActionIcon}>
              <MaterialCommunityIcons name="truck-plus-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Nova Carreta</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('StockReport')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Relatório</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('EmployeeForm')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-add-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Novo Funcionário</Text>
            </TouchableOpacity>
          )}
        </View>

        {isAdmin && (
          <TouchableOpacity 
            style={styles.adminBanner}
            onPress={() => navigation.navigate('EmployeeManagement')}
          >
            <Text style={styles.adminBannerText}>Gerenciar Equipe e Acessos</Text>
            <Ionicons name="people-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[
            styles.fab,
            { bottom: 30 + insets.bottom } // 👈 Posicionamento inteligente do FAB
        ]} 
        onPress={() => navigation.navigate('Movements')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryVariant]}
          style={styles.fabGradient}
        >
          <Ionicons name="swap-vertical" size={28} color="#fff" />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
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
  menuIconText: {
    fontSize: 20,
    color: colors.primary,
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
  profileIconText: {
    fontSize: 14,
  },
  scrollContent: {
    // paddingBottom agora é dinâmico no componente
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
  iconEmoji: {
    fontSize: 20,
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
    borderColor: colors.surfaceVariant,
  },
  movementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
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
    borderColor: colors.surfaceVariant,
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
  actionEmoji: {
    fontSize: 24,
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
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  }
});

export default HomeScreen;
