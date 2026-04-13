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
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { colors, typography } from '../styles/global';
import { registerUser, checkIsAdmin } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // 👈 Adicionado Ionicons

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminPermission = async () => {
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      setCheckingPermission(false);
      
      if (!admin) {
        Alert.alert(
          'Acesso Restrito',
          'Apenas administradores podem cadastrar novos usuários administrativos.',
          [{ text: 'Entendi', onPress: () => navigation.goBack() }]
        );
      }
    };
    checkAdminPermission();
  }, []);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    const admin = await checkIsAdmin();
    if (!admin) {
      Alert.alert('Erro', 'Sem permissão.');
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(email, password, name, 'admin');
      if (result.success) {
        Alert.alert('Sucesso', 'Administrador cadastrado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.deniedContainer}>
        <Ionicons name="lock-closed-outline" size={60} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.deniedTitle}>Acesso Negado</Text>
        <Text style={styles.deniedText}>Apenas administradores de alto nível podem gerenciar contas administrativas.</Text>
        <TouchableOpacity style={styles.deniedButton} onPress={() => navigation.goBack()}>
          <Text style={styles.deniedButtonText}>Voltar ao Painel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Administrador</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formSubtitle}>Crie uma nova conta com privilégios administrativos para o sistema.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              placeholderTextColor={colors.gray}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail de Acesso</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha Temporária</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.gray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryVariant]}
              style={styles.gradientButton}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar Administrador</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar Operação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
  scrollContent: { padding: 24 },
  formCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: colors.outlineVariant,
    marginBottom: 24,
  },
  formSubtitle: { ...typography.body, color: colors.secondary, marginBottom: 32, fontSize: 14, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { ...typography.label, fontSize: 12, color: colors.onSurface, marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: colors.surfaceContainerLow, 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: 'transparent',
    ...typography.body,
  },
  footer: { gap: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.secondary, fontSize: 16 },
  passwordContainer: { position: 'relative', justifyContent: 'center' },
  eyeIcon: { position: 'absolute', right: 0, paddingHorizontal: 16, height: '100%', justifyContent: 'center', alignItems: 'center' },
  deniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: colors.background },
  deniedTitle: { ...typography.headline, fontSize: 24, color: colors.onSurface, marginBottom: 12 },
  deniedText: { ...typography.body, textAlign: 'center', color: colors.secondary, marginBottom: 32, lineHeight: 22 },
  deniedButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 28 },
  deniedButtonText: { ...typography.label, color: '#fff' }
});

export default RegisterScreen;