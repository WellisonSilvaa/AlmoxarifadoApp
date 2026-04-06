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
import { colors, typography } from '../styles/global';
import { createMovement } from '../services/movementService';
import { getItems } from '../services/itemService';
import { getTrucks } from '../services/truckService';
import { auth, db } from '../services/firebase';
import { 
  query, 
  collection, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

const MovementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);

  // Estados do formulário
  const [movementType, setMovementType] = useState('exit');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [notes, setNotes] = useState('');

  // Listas de dados
  const [items, setItems] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const currentUser = auth.currentUser;
  const responsible = currentUser?.email || 'Usuário Logado';

  const loadItemStock = async (itemId) => {
    try {
      const stockQuery = query(
        collection(db, 'movements'),
        where('itemId', '==', itemId),
        where('isActive', '==', true)
      );
      const movementsSnapshot = await getDocs(stockQuery);
      let stock = 0;
      movementsSnapshot.forEach(doc => {
        const movement = doc.data();
        if (movement.type === 'entry') stock += movement.quantity;
        else if (movement.type === 'exit') stock -= movement.quantity;
      });
      setCurrentStock(stock);
    } catch (error) {
      setCurrentStock(0);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedItem) loadItemStock(selectedItem);
    else setCurrentStock(0);
  }, [selectedItem]);

  const loadInitialData = async () => {
    try {
      const [itemsResult, trucksResult] = await Promise.all([getItems(), getTrucks()]);
      if (itemsResult.success) setItems(itemsResult.data);
      if (trucksResult.success) setTrucks(trucksResult.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem) return Alert.alert('Atenção', 'Selecione um item.');
    if (!quantity || quantity <= 0) return Alert.alert('Atenção', 'Informe uma quantidade válida.');
    if (movementType === 'exit' && !selectedTruck) return Alert.alert('Atenção', 'Selecione uma carreta para saída.');
    if (movementType === 'exit' && currentStock < parseInt(quantity)) {
      return Alert.alert('Estoque Insuficiente', `Saldo atual: ${currentStock}`);
    }

    setLoading(true);
    try {
      const item = items.find(i => i.id === selectedItem);
      let truck = movementType === 'exit' ? trucks.find(t => t.id === selectedTruck) : null;

      const result = await createMovement({
        type: movementType,
        itemId: item.id,
        itemName: item.name,
        quantity: parseInt(quantity),
        truckId: truck?.id || '',
        truckPlate: truck?.plate || '',
        responsible: responsible,
        notes: notes.trim(),
        photoUrl: ''
      });

      if (result.success) {
        Alert.alert('Concluído', 'Movimentação registrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Fluxo</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Responsible Bar */}
        <View style={styles.responsibleBar}>
          <View style={styles.userIcon}><Text style={{fontSize: 10}}>👤</Text></View>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemStrip}>
              {items.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.itemCard, selectedItem === item.id && styles.itemCardSelected]}
                  onPress={() => setSelectedItem(item.id)}
                >
                  <Text style={[styles.itemCardName, selectedItem === item.id && styles.whiteText]}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Stock & Quantity */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Quantidade *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                editable={!loading}
              />
            </View>
            {selectedItem && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockLabel}>Saldo Atual</Text>
                <Text style={[styles.stockValue, currentStock < parseInt(quantity || 0) && movementType === 'exit' && {color: colors.error}]}>
                  {currentStock}
                </Text>
              </View>
            )}
          </View>

          {/* Truck Selector (Exit only) */}
          {movementType === 'exit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Destino (Carreta) *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemStrip}>
                {trucks.map(truck => (
                  <TouchableOpacity 
                    key={truck.id} 
                    style={[styles.itemCard, selectedTruck === truck.id && styles.itemCardSelected]}
                    onPress={() => setSelectedTruck(truck.id)}
                  >
                    <Text style={[styles.itemCardName, selectedTruck === truck.id && styles.whiteText]}>{truck.plate}</Text>
                    <Text style={[styles.itemCardSub, selectedTruck === truck.id && styles.whiteText]}>{truck.brand}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

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
    </KeyboardAvoidingView>
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
    height: 80,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingTop: 25,
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
  itemStrip: { flexDirection: 'row' },
  itemCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    justifyContent: 'center',
  },
  itemCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemCardName: { ...typography.title, fontSize: 14, color: colors.onSurface },
  itemCardSub: { ...typography.body, fontSize: 10, color: colors.secondary },
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
  stockBadge: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    minWidth: 100,
  },
  stockLabel: { ...typography.label, fontSize: 10, color: colors.secondary, marginBottom: 4 },
  stockValue: { ...typography.headline, fontSize: 20, color: colors.secondary },
  textArea: { height: 100, textAlignVertical: 'top' },
  footer: { paddingHorizontal: 24, marginTop: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
});

export default MovementScreen;