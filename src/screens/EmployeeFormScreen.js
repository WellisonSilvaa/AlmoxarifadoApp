// src/screens/EmployeeFormScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { createEmployee } from '../services/employeeService';

const EmployeeFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return;
    }

    setLoading(true);
    const result = await createEmployee({ name, email, department, position });
    setLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Cadastrar Funcionário</Text>

        <TextInput style={globalStyles.input} placeholder="Nome*" value={name} onChangeText={setName} />
        <TextInput style={globalStyles.input} placeholder="Email*" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={globalStyles.input} placeholder="Departamento" value={department} onChangeText={setDepartment} />
        <TextInput style={globalStyles.input} placeholder="Cargo" value={position} onChangeText={setPosition} />

        <TouchableOpacity style={globalStyles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={globalStyles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EmployeeFormScreen;