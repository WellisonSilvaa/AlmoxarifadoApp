import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { globalStyles, colors, typography } from '../styles/global';
import { getMovementById } from '../services/movementService';
import LicensePlate from '../components/LicensePlate';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Adicionado ícones

const { width } = Dimensions.get('window');

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

  const styleConfig = useMemo(() => {
    if (!movement) return {};
    const isEntry = movement.type === 'entry';
    return {
      color: isEntry ? '#15803d' : colors.error,
      bg: isEntry ? '#f0fdf4' : '#fef2f2',
      icon: isEntry ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline',
      label: isEntry ? 'ENTRADA' : 'SAÍDA'
    };
  }, [movement]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!movement) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Fluxo</Text>
          <View style={styles.profileIcon} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Type Card */}
        <View style={[styles.heroCard, { backgroundColor: styleConfig.bg }]}>
          <Ionicons name={styleConfig.icon} size={40} color={styleConfig.color} />
          <View>
            <Text style={[styles.heroLabel, { color: styleConfig.color }]}>{styleConfig.label}</Text>
            <Text style={styles.heroId}>#{movement.id.substring(0, 8)}</Text>
          </View>
        </View>

        {/* Info Bento Grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Quantidade</Text>
            <Text style={[styles.bentoValue, { color: styleConfig.color }]}>{movement.quantity}</Text>
            <Text style={styles.bentoSub}>unidades</Text>
          </View>
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Horário</Text>
            <Text style={styles.bentoValue}>
              {movement.date ? movement.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </Text>
            <Text style={styles.bentoSub}>{movement.date?.toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        {/* Item Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produto</Text>
          <View style={styles.itemCard}>
            <View style={styles.itemIcon}>
              <MaterialCommunityIcons name="package-variant-closed" size={24} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{movement.itemName}</Text>
              <Text style={styles.itemMetadata}>ID: {movement.itemId}</Text>
            </View>
          </View>
        </View>

        {/* Logistics Section */}
        {movement.type === 'exit' && movement.truckPlate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logística</Text>
            <View style={styles.logisticsCard}>
              <Text style={styles.logisticsLabel}>Destino / Carreta</Text>
              <View style={styles.plateWrapper}>
                <LicensePlate plate={movement.truckPlate} size="small" />
              </View>
            </View>
          </View>
        )}

        {/* Responsible Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operação</Text>
          <View style={styles.opCard}>
            <View style={styles.opRow}>
              <Text style={styles.opLabel}>Responsável:</Text>
              <Text style={styles.opValue}>{movement.responsible || 'Sistema'}</Text>
            </View>
            <View style={styles.opRow}>
              <Text style={styles.opLabel}>Estado:</Text>
              <Text style={[styles.opValue, { color: '#15803d' }]}>
                Consolidada
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {movement.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{movement.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Movements')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryVariant]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Nova Movimentação</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryText}>Voltar ao Histórico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingTop: 25,
    height: 85,
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
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  heroIcon: {
    fontSize: 32,
  },
  heroLabel: {
    ...typography.headline,
    fontSize: 22,
    letterSpacing: 1,
  },
  heroId: {
    ...typography.body,
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'monospace',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  bentoLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bentoValue: {
    ...typography.headline,
    fontSize: 24,
    color: colors.onSurface,
  },
  bentoSub: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 16,
    paddingLeft: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    ...typography.title,
    fontSize: 17,
    color: colors.onSurface,
    marginBottom: 2,
  },
  itemMetadata: {
    ...typography.body,
    fontSize: 11,
    color: colors.secondary,
  },
  logisticsCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  logisticsLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 12,
  },
  plateWrapper: {
    alignItems: 'flex-start',
  },
  opCard: {
    backgroundColor: colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 20,
  },
  opRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  opLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.secondary,
  },
  opValue: {
    ...typography.body,
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
  },
  notesCard: {
    backgroundColor: '#fffdf0',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  notesText: {
    ...typography.body,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  gradientButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.label,
    fontSize: 16,
    color: '#fff',
    textTransform: 'none',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.label,
    fontSize: 16,
    color: colors.secondary,
    textTransform: 'none',
  }
});

export default MovementDetailScreen;