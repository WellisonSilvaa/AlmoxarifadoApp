import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getMovementById } from '../services/movementService';
import LicensePlate from '../components/LicensePlate';

const MovementDetailScreen = ({ route, navigation }) => {
  const { movementId } = route.params;
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovement();
  }, [movementId]);

  const loadMovement = async () => {
    try {
      const result = await getMovementById(movementId);
      
      if (result.success) {
        setMovement(result.data);
      } else {
        Alert.alert('Erro', result.error);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a movimentação');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type) => {
    return type === 'entry' ? '📥' : '📤';
  };

  const getMovementColor = (type) => {
    return type === 'entry' ? colors.secondary : colors.primary;
  };

  const getMovementTypeText = (type) => {
    return type === 'entry' ? 'ENTRADA' : 'SAÍDA';
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      full: date.toLocaleString('pt-BR')
    };
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando movimentação...</Text>
      </View>
    );
  }

  if (!movement) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Movimentação não encontrada</Text>
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateTime = formatDateTime(movement.date);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      {/* Cabeçalho com Tipo */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: getMovementColor(movement.type) }]}>
          <Text style={styles.typeText}>
            {getMovementIcon(movement.type)} {getMovementTypeText(movement.type)}
          </Text>
        </View>
        <Text style={styles.idText}>ID: {movement.id}</Text>
      </View>

      {/* Data e Hora */}
      <View style={styles.dateTimeSection}>
        <Text style={styles.sectionTitle}>📅 Data e Hora</Text>
        <View style={styles.dateTimeCard}>
          <Text style={styles.dateText}>{dateTime.date}</Text>
          <Text style={styles.timeText}>{dateTime.time}</Text>
          <Text style={styles.fullDateTime}>{dateTime.full}</Text>
        </View>
      </View>

      {/* Item */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Item Movimentado</Text>
        <View style={styles.card}>
          <Text style={styles.itemName}>{movement.itemName}</Text>
          <Text style={styles.itemId}>ID: {movement.itemId}</Text>
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantidade:</Text>
            <Text style={styles.quantityValue}>{movement.quantity} unidades</Text>
          </View>
        </View>
      </View>

      {/* Carreta (apenas para saídas) */}
      {movement.type === 'exit' && movement.truckPlate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 Carreta</Text>
          <View style={styles.card}>
            <Text style={styles.truckLabel}>Placa da Carreta:</Text>
            <View style={styles.licensePlateContainer}>
              <LicensePlate plate={movement.truckPlate} size="large" />
            </View>
            {movement.truckId && (
              <Text style={styles.truckId}>ID: {movement.truckId}</Text>
            )}
          </View>
        </View>
      )}

      {/* Responsável */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Responsável</Text>
        <View style={styles.card}>
          <Text style={styles.responsibleName}>{movement.responsible}</Text>
          <Text style={styles.registradoPor}>
            Registrado por: {movement.createdBy}
          </Text>
        </View>
      </View>

      {/* Observações */}
      {movement.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Observações</Text>
          <View style={styles.card}>
            <Text style={styles.notesText}>{movement.notes}</Text>
          </View>
        </View>
      )}

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Status</Text>
        <View style={styles.card}>
          <Text style={[
            styles.statusText,
            { color: movement.isActive ? colors.secondary : colors.danger }
          ]}>
            {movement.isActive ? '✅ ATIVA' : '❌ INATIVA'}
          </Text>
          <Text style={styles.statusInfo}>
            Esta movimentação está {movement.isActive ? 'ativa no sistema' : 'inativada'}
          </Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <TouchableOpacity 
        style={[globalStyles.button, { backgroundColor: colors.warning }]}
        onPress={() => navigation.navigate('MovementList')}
      >
        <Text style={globalStyles.buttonText}>📋 Voltar para Histórico</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[globalStyles.button, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Movements')}
      >
        <Text style={globalStyles.buttonText}>➕ Nova Movimentação</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  idText: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 10,
  },
  dateTimeCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  timeText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 5,
  },
  fullDateTime: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.light,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  itemId: {
    color: colors.gray,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    color: colors.gray,
    fontSize: 14,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  truckLabel: {
    color: colors.gray,
    fontSize: 14,
    marginBottom: 10,
  },
  licensePlateContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  truckId: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  responsibleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  registradoPor: {
    color: colors.gray,
    fontSize: 12,
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusInfo: {
    fontSize: 12,
    color: colors.gray,
  },
};

export default MovementDetailScreen;