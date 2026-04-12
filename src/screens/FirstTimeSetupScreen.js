
// src/screens/FirstTimeSetupScreen.js
import React, { useState } from 'react';
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

const FirstTimeSetupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSetup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Criar primeiro admin no Supabase
      const result = await registerUser(email, password, name, 'admin');
      
      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Usuário administrador mestre criado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login')
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[globalStyles.container, { justifyContent: 'center' }]}>
        <Text style={globalStyles.title}>Configuração Inicial</Text>

        <Text style={{
          textAlign: 'center',
          marginBottom: 30,
          color: colors.dark,
          fontSize: 16
        }}>
          Bem-vindo! Crie o primeiro usuário administrador do sistema.
        </Text>

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