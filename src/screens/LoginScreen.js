// src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { loginUser, onAuthStateChanged } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar se usuário já está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        // Usuário já está autenticado, redirecionar para Home
        navigation.replace('Home');
      }
      setCheckingAuth(false);
    });

    return unsubscribe; // Limpar subscription ao desmontar
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Login bem-sucedido - redirecionar para Home
        // As permissões serão verificadas automaticamente na HomeScreen
        navigation.replace('Home');
      } else {
        // Erro no login
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Verificando autenticação...</Text>
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
            Controle de Almoxarifado
          </Text>
          <Text style={{ 
            textAlign: 'center', 
            marginBottom: 30, 
            color: colors.dark,
            fontSize: 16
          }}>
            Acesso ao Sistema de Almoxarifado
          </Text>
          
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
            placeholder="Senha"
            placeholderTextColor={colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          {/* Botão de Login */}
          <TouchableOpacity 
            style={[globalStyles.button, loading && { backgroundColor: colors.gray }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={globalStyles.buttonText}>Entrar no Sistema</Text>
            )}
          </TouchableOpacity>
          
          <Text style={{ 
            textAlign: 'center', 
            marginTop: 20, 
            color: colors.gray,
            fontSize: 14
          }}>
            Versão 1.0 - Sistema de Gestão
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;