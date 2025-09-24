import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { getTrucks } from '../services/truckService';
import { getImageUrl } from '../utils/storageUtils';

import LicensePlate from '../components/LicensePlate';
import RealisticLicensePlate from '../components/RealisticLicensePlate';

const TruckListScreen = ({ navigation }) => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrucks = async () => {
    try {
      console.log('Carregando carretas...');
      const result = await getTrucks();
      
      console.log('Resultado da busca:', result);
      
      if (result.success) {
        console.log('Carretas encontradas:', result.data.length);
        setTrucks(result.data);
      } else {
        console.log('Erro ao carregar carretas:', result.error);
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      console.error('Erro completo na loadTrucks:', error);
      Alert.alert('Erro', 'Não foi possível carregar as carretas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrucks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrucks();
  };

  const renderTruck = ({ item }) => (
  <TouchableOpacity 
    style={globalStyles.card}
    onPress={() => navigation.navigate('TruckDetail', { truckId: item.id })}
  >
    {/* Imagem da Carreta */}
    {item.photoUrl && (
      <Image
        source={{ uri: getImageUrl(item.photoUrl) }}
        style={{
          width: '100%',
          height: 120,
          borderRadius: 8,
          marginBottom: 10
        }}
        resizeMode="cover"
      />
    )}
    
     {/* 👇 PLACA MERCOSUL - NOVO DESIGN */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <LicensePlate plate={item.plate} size="small" />
      </View>
      
      {/* Marca e Modelo */}
      {(item.brand || item.model) && (
        <Text style={{ 
          color: colors.dark, 
          marginBottom: 5, 
          textAlign: 'center',
          fontSize: 16,
          fontWeight: '500'
        }}>
          {item.brand} {item.model}
        </Text>
      )}
      
      {/* Ano e Capacidade */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around',
        marginTop: 5
      }}>
        {item.year && (
          <Text style={{ color: colors.gray, fontSize: 12 }}>
            📅 {item.year}
          </Text>
        )}
        
        {item.capacity && (
          <Text style={{ color: colors.gray, fontSize: 12 }}>
            ⚖️ {item.capacity}
          </Text>
        )}
      </View>
      
      {/* Data de Cadastro */}
      <Text style={{ 
        color: colors.gray, 
        fontSize: 10, 
        marginTop: 8,
        textAlign: 'center'
      }}>
        Cadastrada em: {item.createdAt ? item.createdAt.toLocaleDateString('pt-BR') : 'N/A'}
      </Text>
      
      {/* Status */}
      <Text style={{ 
        color: item.isActive ? colors.secondary : colors.danger,
        fontWeight: 'bold',
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center'
      }}>
        {item.isActive ? '✅ ATIVA' : '❌ INATIVA'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Carregando carretas...</Text>
      </View>
    );
  }


  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Frota de Carretas</Text>
      
      <Text style={{ 
        marginBottom: 20, 
        color: colors.dark,
        textAlign: 'center'
      }}>
        Total: {trucks.length} carreta(s) ativa(s)
      </Text>

      <FlatList
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: colors.gray, fontSize: 16 }}>
              Nenhuma carreta cadastrada ainda.
            </Text>
            <Text style={{ color: colors.gray, marginTop: 10, textAlign: 'center' }}>
              Clique no botão abaixo para cadastrar a primeira carreta!
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={globalStyles.button}
        onPress={() => navigation.navigate('TruckForm')}
      >
        <Text style={globalStyles.buttonText}>🚚 Nova Carreta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TruckListScreen;