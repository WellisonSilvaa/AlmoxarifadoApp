// src/screens/HomeScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { auth } from '../services/firebase';
import { logoutUser, checkIsAdmin } from '../services/authService';
import { getItems } from '../services/itemService';
import { getTrucks } from '../services/truckService';
import { getMovements } from '../services/movementService';
import { getLowStockItems } from '../services/stockService';
import { useFocusEffect } from '@react-navigation/native';

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
      // Verificar se é admin (apenas para cadastrar administradores)
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

      // Pegar últimas 3 movimentações
      const recentMovements = movements.slice(0, 3);

      setStats({
        itemsCount: items.length,
        trucksCount: trucks.length,
        movementsCount: movements.length,
        lowStockCount: lowStockItems.length,
        recentMovements: recentMovements
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
      // Recarregar stats e permissões sempre que a tela ganhar foco
      // Isso garante que as permissões sejam verificadas após o login
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
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: async () => {
            const result = await logoutUser();
            if (result.success) {
              navigation.replace('Login');
            } else {
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActionButton = ({ icon, label, color, onPress, style }) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.dark }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo!</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            icon="📦"
            title="Itens"
            value={stats.itemsCount}
            color={colors.primary}
            onPress={() => navigation.navigate('ItemList')}
          />
          <StatCard
            icon="🚚"
            title="Carretas"
            value={stats.trucksCount}
            color={colors.secondary}
            onPress={() => navigation.navigate('TruckList')}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="📋"
            title="Movimentações"
            value={stats.movementsCount}
            color={colors.warning}
            onPress={() => navigation.navigate('MovementList')}
          />
          <StatCard
            icon="⚠️"
            title="Estoque Baixo"
            value={stats.lowStockCount}
            color={stats.lowStockCount > 0 ? colors.danger : colors.secondary}
            onPress={() => navigation.navigate('StockReport')}
          />
        </View>
      </View>

      {/* Alertas de Estoque Baixo */}
      {stats.lowStockCount > 0 && (
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('StockReport')}
        >
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Atenção: Estoque Baixo</Text>
            <Text style={styles.alertText}>
              {stats.lowStockCount} {stats.lowStockCount === 1 ? 'item precisa' : 'itens precisam'} de reposição
            </Text>
          </View>
          <Text style={styles.alertArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Seção: Cadastros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Cadastros</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="📦"
            label="Novo Item"
            color={colors.warning}
            onPress={() => navigation.navigate('ItemForm')}
          />
          <ActionButton
            icon="🚚"
            label="Nova Carreta"
            color={colors.dark}
            onPress={() => navigation.navigate('TruckForm')}
          />
          <ActionButton
            icon="👤"
            label="Funcionário"
            color={colors.secondary}
            onPress={() => navigation.navigate('EmployeeForm')}
          />
        </View>
      </View>

      {/* Seção: Movimentações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Movimentações</Text>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('Movements')}
        >
          <Text style={styles.primaryActionIcon}>➕</Text>
          <Text style={styles.primaryActionText}>Nova Movimentação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryActionButton, { backgroundColor: colors.dark, marginTop: 10 }]}
          onPress={() => navigation.navigate('MovementList')}
        >
          <Text style={styles.primaryActionIcon}>📋</Text>
          <Text style={styles.primaryActionText}>Histórico de Movimentações</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Relatórios e Listas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Relatórios e Listas</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon="📦"
            label="Lista de Itens"
            color={colors.primary}
            onPress={() => navigation.navigate('ItemList')}
          />
          <ActionButton
            icon="🚚"
            label="Lista de Carretas"
            color={colors.dark}
            onPress={() => navigation.navigate('TruckList')}
          />
          <ActionButton
            icon="📊"
            label="Relatório de Estoque"
            color={colors.secondary}
            onPress={() => navigation.navigate('StockReport')}
          />
        </View>
      </View>

      {/* Seção: Configurações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.configButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.configIcon}>👨‍💼</Text>
            <Text style={styles.configText}>Cadastrar Administrador</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.configButton, { backgroundColor: colors.danger, marginTop: isAdmin ? 10 : 0 }]}
          onPress={handleLogout}
        >
          <Text style={styles.configIcon}>🚪</Text>
          <Text style={styles.configText}>Sair do Sistema</Text>
        </TouchableOpacity>
      </View>

      {/* Espaçamento final */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light
  },
  welcomeText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.light
  },
  logoutIcon: {
    fontSize: 20
  },
  statsContainer: {
    padding: 15,
    paddingBottom: 10
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500'
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  alertIcon: {
    fontSize: 28,
    marginRight: 12
  },
  alertContent: {
    flex: 1
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4
  },
  alertText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9
  },
  alertArrow: {
    fontSize: 24,
    color: colors.white,
    marginLeft: 10
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 15
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  actionButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  actionLabel: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 5
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  primaryActionIcon: {
    fontSize: 24,
    marginRight: 12
  },
  primaryActionText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    flex: 1
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  configIcon: {
    fontSize: 20,
    marginRight: 12
  },
  configText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '500'
  }
});

export default HomeScreen;