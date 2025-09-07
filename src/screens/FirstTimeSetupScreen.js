// src/screens/FirstTimeSetupScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { registerUser } from '../services/authService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const FirstTimeSetupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);

  // Verificar se já existem usuários no sistema


  const handleSetup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await registerUser(email, password, name);
      
      if (result.success) {
        // Aqui você pode adicionar lógica para salvar informações adicionais
        // no Firestore sobre este usuário mestre
        Alert.alert(
          'Sucesso',
          'Usuário administrador mestre criado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Home')
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  // if (checkingUsers) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //       <Text style={{ marginTop: 10 }}>Verificando configuração inicial...</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[globalStyles.container, { justifyContent: 'center' }]}>
        <Text style={globalStyles.title}>
          Configuração Inicial
        </Text>

        <Text style={{
          textAlign: 'center',
          marginBottom: 30,
          color: colors.dark,
          fontSize: 16
        }}>
          Bem-vindo! Crie o primeiro usuário administrador do sistema.
        </Text>

        {/* Formulário igual ao de registro */}
        <TextInput
          style={globalStyles.input}
          placeholder="Nome completo"
          placeholderTextColor={colors.gray}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.gray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Senha (mínimo 6 caracteres)"
          placeholderTextColor={colors.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Confirmar senha"
          placeholderTextColor={colors.gray}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[globalStyles.button, loading && { backgroundColor: colors.gray }]}
          onPress={handleSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Criar Usuário Mestre</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default FirstTimeSetupScreen;