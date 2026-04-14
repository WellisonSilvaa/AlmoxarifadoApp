
// src/screens/MovementScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { createMovement } from '../services/movementService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // 👈 Adicionado ícones
import SearchableSelector from '../components/SearchableSelector';
import { useData } from '../context/DataContext';

const MovementScreen = ({ navigation }) => {
  const { user, items, trucks, refreshData } = useData();
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  // Estados do formulário
  const [movementType, setMovementType] = useState('exit');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [notes, setNotes] = useState('');

  const responsible = user?.email || 'Usuário Logado';

  // Sincronizar stock local com o que temos no contexto para o item selecionado
  useEffect(() => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      setCurrentStock(item ? item.currentStock : 0);
    } else {
      setCurrentStock(0);
    }
  }, [selectedItem, items]);

  const handleSubmit = async () => {
    const qtyInt = parseInt(quantity);

    if (!selectedItem) return Alert.alert('Atenção', 'Selecione um item.');
    if (!quantity || isNaN(qtyInt) || qtyInt <= 0) {
      return Alert.alert('Atenção', 'Informe uma quantidade válida (número positivo).');
    }
    
    if (movementType === 'exit') {
      if (!selectedTruck) return Alert.alert('Atenção', 'Selecione uma carreta para saída.');
      if (currentStock < qtyInt) {
        return Alert.alert('Estoque Insuficiente', `Saldo disponível: ${currentStock}`);
      }
    }

    setLoading(true);
    try {
      const item = items.find(i => i.id === selectedItem);
      let truck = selectedTruck ? trucks.find(t => t.id === selectedTruck) : null;

      const result = await createMovement({
        type: movementType,
        itemId: item.id,
        itemName: item.name,
        quantity: qtyInt,
        truckId: truck?.id || '',
        truckPlate: truck?.plate || '',
        responsible: responsible,
        notes: notes.trim(),
        photoUrl: ''
      });

      if (result.success) {
        refreshData(); // ⚡ Background Sync
        Alert.alert('Concluído', 'Movimentação registrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', result.error);
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar movimentação.');
      setLoading(false);
    }
  };

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [truckModalVisible, setTruckModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Fluxo</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Responsible Bar */}
        <View style={styles.responsibleBar}>
          <View style={styles.userIcon}>
              <Ionicons name="person-outline" size={12} color={colors.primary} />
          </View>
          <Text style={styles.responsibleText}>{responsible}</Text>
        </View>

        {/* Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, movementType === 'entry' && styles.toggleBtnActive]} 
            onPress={() => setMovementType('entry')}
          >
            <Text style={[styles.toggleText, movementType === 'entry' && styles.toggleTextActive]}>Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, movementType === 'exit' && styles.toggleBtnActive]} 
            onPress={() => setMovementType('exit')}
          >
            <Text style={[styles.toggleText, movementType === 'exit' && styles.toggleTextActive]}>Saída</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Item Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Produto *</Text>
            <TouchableOpacity 
              style={[styles.selectorButton, selectedItem && styles.selectorButtonActive]}
              onPress={() => setItemModalVisible(true)}
            >
              <Text style={[styles.selectorButtonText, selectedItem && styles.selectorButtonTextActive]}>
                {selectedItem ? items.find(i => i.id === selectedItem)?.name : 'Selecionar Produto...'}
              </Text>
              <Ionicons name="search-outline" size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Stock & Quantity */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <Text style={styles.label}>Quantidade *</Text>
                {selectedItem && (
                    <View style={styles.miniStockBadge}>
                        <Text style={styles.miniStockLabel}>Disponível: </Text>
                        <Text style={[styles.miniStockValue, currentStock < parseInt(quantity || 0) && movementType === 'exit' && {color: colors.error, fontWeight: 'bold'}]}>
                           {currentStock}
                        </Text>
                    </View>
                )}
            </View>
            <TextInput
            style={[
                styles.input, 
                currentStock < parseInt(quantity || 0) && movementType === 'exit' && { borderColor: colors.error, borderWidth: 2 }
            ]}
            placeholder="0"
            keyboardType="numeric"
            value={quantity}
            onChangeText={(val) => setQuantity(val.replace(/[^0-9]/g, ''))}
            editable={!loading}
            />
          </View>

          {/* Truck Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {movementType === 'exit' ? 'Destino (Carreta) *' : 'Origem (Carreta) - Opcional'}
            </Text>
            <TouchableOpacity 
              style={[styles.selectorButton, selectedTruck && styles.selectorButtonActive]}
              onPress={() => setTruckModalVisible(true)}
            >
              <Text style={[styles.selectorButtonText, selectedTruck && styles.selectorButtonTextActive]}>
                {selectedTruck ? trucks.find(t => t.id === selectedTruck)?.plate : 'Selecionar Carreta...'}
              </Text>
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas sobre a carga..."
              multiline
              value={notes}
              onChangeText={setNotes}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryVariant]}
              style={styles.gradientButton}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirmar Registro</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modais de Busca */}
      <SearchableSelector
        visible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        onSelect={(item) => setSelectedItem(item.id)}
        items={items}
        title="Buscar Produto"
        placeholder="Digite o nome do item..."
      />

      <SearchableSelector
        visible={truckModalVisible}
        onClose={() => setTruckModalVisible(false)}
        onSelect={(truck) => setSelectedTruck(truck.id)}
        items={trucks}
        title="Buscar Carreta"
        placeholder="Digite a placa ou marca..."
        itemLabelKey="plate"
        itemSubLabelKey="brand"
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  scrollContent: { paddingBottom: 40 },
  responsibleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
  },
  userIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  responsibleText: { ...typography.body, fontSize: 13, color: colors.secondary },
  toggleContainer: {
    flexDirection: 'row',
    margin: 24,
    backgroundColor: '#eee',
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.1, shadowRadius:2 },
  toggleText: { ...typography.label, color: colors.secondary },
  toggleTextActive: { color: colors.primary },
  form: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 24 },
  label: { ...typography.label, fontSize: 13, color: colors.onSurface, marginBottom: 12 },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  selectorButtonText: {
    ...typography.body,
    fontSize: 15,
    color: colors.secondary,
  },
  selectorButtonTextActive: {
    color: colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  selectorIcon: {
    fontSize: 18,
    color: colors.secondary,
  },
  whiteText: { color: '#fff' },
  row: { flexDirection: 'row', gap: 16, marginBottom: 24, alignItems: 'flex-start' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    ...typography.body,
  },
  miniStockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  miniStockLabel: { ...typography.label, fontSize: 10, color: colors.secondary, textTransform: 'none' },
  miniStockValue: { ...typography.title, fontSize: 12, color: colors.onSurface },
  textArea: { height: 100, textAlignVertical: 'top' },
  footer: { paddingHorizontal: 24, marginTop: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
});

export default MovementScreen;