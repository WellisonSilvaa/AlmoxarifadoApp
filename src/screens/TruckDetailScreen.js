
// src/screens/TruckDetailScreen.js
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { getTruckById, deleteTruck } from '../services/truckService';
import { getImageUrl } from '../utils/storageUtils';
import LicensePlate from '../components/LicensePlate';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

const TruckDetailScreen = ({ route, navigation }) => {
  const { truckId } = route.params;
  const { refreshData, removeTruckFromState } = useData(); // 💡 Importando utilitário
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

  useFocusEffect(
    useCallback(() => {
      loadTruck();
    }, [truckId])
  );

  const handleDelete = async () => {
    Alert.alert(
      "Excluir Carreta",
      "Tem certeza que deseja desativar esta carreta do sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive",
          onPress: async () => {
            const result = await deleteTruck(truckId);
            if (result.success) {
              // 🚀 ATUALIZAÇÃO OTIMISTA: Remove da lista local antes de qualquer coisa
              removeTruckFromState(truckId); 
              
              refreshData(); // 🔥 Atualiza o resto em background
              navigation.goBack(); // 🚄 Volta instantaneamente (a lista já estará sem o item)
            } else {
              Alert.alert("Erro", result.error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!truck) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {truck.photoUrl ? (
            <Image
              source={{ uri: getImageUrl(truck.photoUrl) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Text style={styles.placeholderEmoji}>🚚</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.headerInfo}>
            <LicensePlate plate={truck.plate} size="medium" />
            <View style={[
              styles.statusBadge, 
              { backgroundColor: truck.isActive ? '#f0fdf4' : '#fff1f2' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: truck.isActive ? '#15803d' : colors.error }
              ]}>
                {truck.isActive ? 'Em Operação' : 'Inativa'}
              </Text>
            </View>
          </View>

          <Text style={styles.truckTitle}>{truck.brand} {truck.model}</Text>

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

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('TruckForm', { truckId: truck.id })}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryVariant]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Editar carreta</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteText}>Desativar Carreta</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  placeholderEmoji: {
    fontSize: 60,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  safeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    marginTop: Platform.OS === 'android' ? 10 : 0,
    marginLeft: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
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
  primaryButton: {
    width: '100%',
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
  },
  deleteButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    ...typography.label,
    fontSize: 16,
    color: colors.error,
  }
});

export default TruckDetailScreen;
