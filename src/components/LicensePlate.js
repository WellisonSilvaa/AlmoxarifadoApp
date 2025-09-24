import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/global';

const LicensePlate = ({ plate, size = 'medium' }) => {
  if (!plate) return null;

  // Formatar a placa (AAA0A00 → AAA-0A00)
  const formattedPlate = plate.length === 7 
    ? `${plate.substring(0, 3)}-${plate.substring(3)}`
    : plate;

  // Tamanhos diferentes
  const sizes = {
    small: { width: 140, height: 60, fontSize: 18 },
    medium: { width: 160, height: 80, fontSize: 18 },
    large: { width: 200, height: 100, fontSize: 22 }
  };

  const { width, height, fontSize } = sizes[size] || sizes.medium;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Faixa azul superior */}
      <View style={styles.blueStrip}>
        <Text style={styles.mercosulText}>MERCO</Text>
        <Text style={styles.sulText}>SUL</Text>
      </View>
      
      {/* Placa principal */}
      <View style={styles.plate}>
        <Text style={[styles.plateText, { fontSize }]}>
          {formattedPlate}
        </Text>
      </View>
      
      {/* Faixa inferior - Brasil */}
      <View style={styles.brasilStrip}>
        <Text style={styles.brasilText}>BRASIL</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  blueStrip: {
    backgroundColor: '#0047AB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: '25%',
  },
  mercosulText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sulText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  plateText: {
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  brasilStrip: {
    backgroundColor: '#009C3B',
    height: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brasilText: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default LicensePlate;