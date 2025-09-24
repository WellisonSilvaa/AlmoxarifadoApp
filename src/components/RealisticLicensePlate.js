// src/components/RealisticLicensePlate.js (OPCIONAL)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RealisticLicensePlate = ({ plate }) => {
  if (!plate) return null;

  const formattedPlate = plate.length === 7 
    ? `${plate.substring(0, 3)}-${plate.substring(3)}`
    : plate;

  return (
    <View style={styles.container}>
      {/* Refletores laterais */}
      <View style={styles.reflectorLeft} />
      
      <View style={styles.plateContent}>
        {/* Bandeira do Mercosul */}
        <View style={styles.flagSection}>
          <View style={styles.blueSquare} />
          <View style={styles.whiteSquare}>
            <Text style={styles.stars}>★</Text>
          </View>
        </View>
        
        {/* Número da placa */}
        <Text style={styles.plateNumber}>{formattedPlate}</Text>
        
        {/* Brasil */}
        <View style={styles.countrySection}>
          <Text style={styles.countryText}>BR</Text>
        </View>
      </View>
      
      <View style={styles.reflectorRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 8,
    marginVertical: 5,
  },
  reflectorLeft: {
    width: 4,
    backgroundColor: '#FFD700',
    marginRight: 5,
    borderRadius: 2,
  },
  reflectorRight: {
    width: 4,
    backgroundColor: '#FFD700',
    marginLeft: 5,
    borderRadius: 2,
  },
  plateContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueSquare: {
    width: 20,
    height: 15,
    backgroundColor: '#0047AB',
    marginRight: 2,
  },
  whiteSquare: {
    width: 20,
    height: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  stars: {
    fontSize: 8,
    color: '#0047AB',
  },
  plateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  countrySection: {
    backgroundColor: '#009C3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  countryText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default RealisticLicensePlate;