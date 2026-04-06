import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { colors, typography } from '../styles/global';
import { getTruckById } from '../services/truckService';
import { getImageUrl } from '../utils/storageUtils';
import LicensePlate from '../components/LicensePlate';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TruckDetailScreen = ({ route, navigation }) => {
  const { truckId } = route.params;
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTruck = async () => {
    try {
      const result = await getTruckById(truckId);
      if (result.success) {
        setTruck(result.data);
      } else {
        Alert.alert('Erro', result.error);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da carreta');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTruck();
  }, [truckId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!truck) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Header with Image */}
        <View style={styles.heroContainer}>
          {truck.photoUrl ? (
            <Image
              source={{ uri: getImageUrl(truck.photoUrl) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Text style={{ fontSize: 60 }}>🚚</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.headerInfo}>
            <LicensePlate plate={truck.plate} size="large" />
            <View style={[styles.statusBadge, { backgroundColor: truck.isActive ? '#f0fdf4' : '#fff1f2' }]}>
              <Text style={[styles.statusText, { color: truck.isActive ? '#15803d' : colors.error }]}>
                {truck.isActive ? 'Em Operação' : 'Inativa'}
              </Text>
            </View>
          </View>

          <Text style={styles.truckTitle}>{truck.brand} {truck.model}</Text>

          {/* Bento Grid Specs */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Capacidade</Text>
              <Text style={styles.bentoValue}>{truck.capacity || 'N/A'}</Text>
              <Text style={styles.bentoSub}>toneladas</Text>
            </View>
            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Fabricação</Text>
              <Text style={styles.bentoValue}>{truck.year || '----'}</Text>
              <Text style={styles.bentoSub}>ano modelo</Text>
            </View>
          </View>

          {/* Detailed Info */}
          <View style={styles.detailsSection}>
             <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Marca</Text>
              <Text style={styles.detailValue}>{truck.brand || 'Não informada'}</Text>
            </View>
             <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Modelo</Text>
              <Text style={styles.detailValue}>{truck.model || 'Não informado'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Cadastro</Text>
              <Text style={styles.detailValue}>
                {truck.createdAt ? truck.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => Alert.alert('Aviso', 'Funcionalidade de edição em breve.')}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryVariant]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Editar Registro</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryText}>Voltar à Frota</Text>
            </TouchableOpacity>
          </View>
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
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 25,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
    paddingTop: 32,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...typography.label,
    fontSize: 12,
  },
  truckTitle: {
    ...typography.headline,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: 24,
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
  detailsSection: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  detailLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.secondary,
  },
  detailValue: {
    ...typography.body,
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
  },
  actions: {
    gap: 12,
    marginBottom: 40,
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

export default TruckDetailScreen;
