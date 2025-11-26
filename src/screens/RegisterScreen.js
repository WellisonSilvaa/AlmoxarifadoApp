// src/screens/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { registerUser, checkIsAdmin } from '../services/authService';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se usuário é admin ao carregar tela
  useEffect(() => {
    const checkAdminPermission = async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      setCheckingPermission(false);
      
      if (!admin) {
        Alert.alert(
          'Acesso Negado',
          'Apenas administradores podem cadastrar outros administradores.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    };

    checkAdminPermission();
  }, []);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // Verificar novamente se é admin antes de cadastrar
    const admin = await checkIsAdmin();
    if (!admin) {
      Alert.alert('Erro', 'Apenas administradores podem cadastrar outros administradores.');
      navigation.goBack();
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(email, password, name, 'admin');
      
      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Administrador cadastrado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
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

  // Mostrar loading enquanto verifica permissão
  if (checkingPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Verificando permissões...</Text>
      </View>
    );
  }

  // Se não for admin, não mostrar o formulário
  if (!isAdmin) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center' }]}>
        <Text style={globalStyles.title}>Acesso Negado</Text>
        <Text style={{ textAlign: 'center', color: colors.dark, marginBottom: 20 }}>
          Apenas administradores podem cadastrar outros administradores.
        </Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[globalStyles.container, { justifyContent: 'center' }]}>
          <Text style={globalStyles.title}>
            Cadastrar Administrador
          </Text>

          <Text style={{
            textAlign: 'center',
            marginBottom: 30,
            color: colors.dark,
            fontSize: 16
          }}>
            Preencha os dados do novo administrador
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Cadastrar Administrador</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;