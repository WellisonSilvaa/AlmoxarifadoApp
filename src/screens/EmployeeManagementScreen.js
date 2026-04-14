// src/screens/EmployeeManagementScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { getEmployees, deleteEmployee } from '../services/employeeService';
import { getCurrentUserData, supabase } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const EmployeeManagementScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    let myPosition = '';

    try {
      // 1. Carregar usuário atual e sua posição para regras de permissão
      const authData = await getCurrentUserData();
      if (authData.success) {
        if (authData.data.employee_id) {
          const { data: emp } = await supabase
            .from('employees')
            .select('position')
            .eq('id', authData.data.employee_id)
            .single();
          myPosition = (emp?.position || '').toLowerCase();
        }
        setCurrentUserData({ ...authData.data, position: myPosition });
      }

      // 2. Carregar todos os funcionários e aplicar filtros de visualização
      const result = await getEmployees();
      if (result.success) {
        const isMyDev = myPosition.includes('dev');
        const filteredEmployees = result.data.filter(emp => {
          const targetPos = (emp.position || '').toLowerCase();
          const isTargetDev = targetPos.includes('dev');
          // Devs são invisíveis para não-Devs
          if (isTargetDev && !isMyDev) return false;
          return true;
        });
        setEmployees(filteredEmployees);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getPermissions = (targetEmployee) => {
    if (!currentUserData) return { canEdit: false, canDelete: false };
    const myPos = currentUserData.position;
    const isMyDev = myPos.includes('dev');

    // Dev tem total acesso
    if (isMyDev) return { canEdit: true, canDelete: true };

    const targetPos = (targetEmployee.position || '').toLowerCase();
    const isTargetAdmin = targetPos.includes('admin') || targetPos.includes('dev');

    // Administrador verificando outro Administrador/Dev (não pode alterar, só ver)
    if (isTargetAdmin) {
      return { canEdit: false, canDelete: false };
    }
    
    // Administrador verificando um funcionário normal
    return { canEdit: true, canDelete: true };
  };

  const handleDelete = (employee) => {
    const { canDelete } = getPermissions(employee);
    if (!canDelete) {
      Alert.alert('Acesso Negado', 'Permissão insuficiente para remover este administrador. Apenas Devs têm esta permissão.');
      return;
    }

    Alert.alert(
      'Remover Funcionário',
      `Tem certeza que deseja remover ${employee.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            const res = await deleteEmployee(employee.id);
            if (res.success) {
              setEmployees(prev => prev.filter(e => e.id !== employee.id));
            } else {
              Alert.alert('Erro', res.error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const targetPos = (item.position || '').toLowerCase();
    const isTargetAdmin = targetPos.includes('admin') || targetPos.includes('dev');
    const badgeColor = targetPos.includes('dev') ? '#6b21a8' : colors.error;
    const badgeBg = targetPos.includes('dev') ? '#f3e8ff' : '#fee2e2';

    const { canEdit, canDelete } = getPermissions(item);

    return (
      <View style={styles.employeeCard}>
        <View style={styles.employeeInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.employeeName}>{item.name}</Text>
            {isTargetAdmin && (
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>
                  {targetPos.includes('dev') ? 'DEV' : 'ADMIN'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.employeeMeta}>{item.email}</Text>
          <Text style={styles.employeeMeta}>{item.department || 'N/A'} • {item.position || 'N/A'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (!canEdit) {
                Alert.alert('Acesso Restrito', 'Você não pode alterar o perfil de outros administradores.');
                return;
              }
              navigation.navigate('EmployeeForm', { employee: item, mode: 'edit' });
            }}
          >
            <Ionicons name="create-outline" size={22} color={canEdit ? colors.primary : colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={22} color={canDelete ? colors.error : colors.gray} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Equipe</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum funcionário encontrado.</Text>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('EmployeeForm', { mode: 'create' })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: { ...typography.headline, fontSize: 18, color: colors.primary },
  backButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  employeeInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  employeeName: { ...typography.title, fontSize: 16, color: colors.onSurface, marginRight: 8 },
  badge: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { ...typography.label, fontSize: 10, color: colors.error },
  employeeMeta: { ...typography.body, fontSize: 13, color: colors.secondary, marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 8 },
  emptyText: { ...typography.body, textAlign: 'center', color: colors.secondary, marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});

export default EmployeeManagementScreen;
