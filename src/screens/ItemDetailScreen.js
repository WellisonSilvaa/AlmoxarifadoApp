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
import { globalStyles, colors, typography } from '../styles/global';
import { getItemById, deleteItem } from '../services/itemService';
import { getImageUrl } from '../utils/storageUtils';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [itemId])
  );

  const loadItem = async () => {
    try {
      const result = await getItemById(itemId);
      if (result.success) {
        setItem(result.data);
      } else {
        Alert.alert('Erro', result.error);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o item');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteItem(item.id);
              if (result.success) {
                Alert.alert("Sucesso", result.message, [
                  { text: "OK", onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert("Erro", result.error);
              }
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o item");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Header with Image */}
        <View style={styles.heroContainer}>
          {item.photoUrl ? (
            <Image
              source={{ uri: getImageUrl(item.photoUrl) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Text style={{ fontSize: 60 }}>📦</Text>
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
          <View style={styles.titleRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#f0fdf4' : '#fff1f2' }]}>
              <Text style={[styles.statusText, { color: item.isActive ? '#15803d' : colors.error }]}>
                {item.isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {item.description || 'Nenhuma descrição detalhada disponível para este item.'}
          </Text>

          {/* Info Bento Grid */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Estoque Atual</Text>
              <Text style={styles.bentoValue}>{item.currentStock || 0}</Text>
              <Text style={styles.bentoSub}>unidades</Text>
            </View>
            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Estoque Mínimo</Text>
              <Text style={[styles.bentoValue, { color: colors.secondary }]}>{item.minStock || 0}</Text>
              <Text style={styles.bentoSub}>limite de alerta</Text>
            </View>
          </View>

          {/* Detailed Info */}
          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Identificador</Text>
              <Text style={styles.detailValue}>{item.id}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Data de Cadastro</Text>
              <Text style={styles.detailValue}>
                {item.createdAt ? item.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryVariant]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Editar Registro</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteItem}
            >
              <Text style={styles.deleteText}>Excluir Item</Text>
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
    height: 350,
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
    height: 150,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  itemName: {
    ...typography.headline,
    fontSize: 26,
    color: colors.onSurface,
    flex: 1,
    marginRight: 12,
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
  description: {
    ...typography.body,
    fontSize: 15,
    color: colors.secondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
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
    fontSize: 12,
    color: colors.secondary,
  },
  detailsSection: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 20,
    padding: 16,
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
    gap: 16,
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
    textTransform: 'none',
  },
});

export default ItemDetailScreen;