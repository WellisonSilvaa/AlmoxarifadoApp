// src/screens/EmployeeFormScreen.js
import React, { useState } from 'react';
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
import { createEmployee } from '../services/employeeService';
import { registerEmployee } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const EmployeeFormScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name || !email) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }
    if (!password || !confirmPassword) {
      Alert.alert('Erro', 'Senha e confirmação de senha são obrigatórias');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const employeeResult = await createEmployee({ name, email, department, position });
      if (!employeeResult.success) {
        Alert.alert('Erro', employeeResult.error);
        setLoading(false);
        return;
      }
      const authResult = await registerEmployee(email, password, name, employeeResult.id);
      if (!authResult.success) {
        Alert.alert('Atenção', 'Funcionário salvo, mas houve erro ao criar conta de acesso.');
        setLoading(false);
        return;
      }
      Alert.alert('Sucesso', 'Funcionário cadastrado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar funcionário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Funcionário</Text>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Profissionais</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput style={styles.input} placeholder="Nome do funcionário" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail Corporativo *</Text>
            <TextInput style={styles.input} placeholder="email@empresa.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Departamento</Text>
              <TextInput style={styles.input} placeholder="Ex: Logística" value={department} onChangeText={setDepartment} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Cargo</Text>
              <TextInput style={styles.input} placeholder="Ex: Assistente" value={position} onChangeText={setPosition} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança e Acesso</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha de Acesso *</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha *</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <LinearGradient colors={[colors.primary, colors.primaryVariant]} style={styles.gradientButton}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar Funcionário</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  section: { marginBottom: 32 },
  sectionTitle: { ...typography.title, fontSize: 18, color: colors.primary, marginBottom: 20, marginLeft: 4 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 16 },
  label: { ...typography.label, fontSize: 12, color: colors.onSurface, marginBottom: 8, marginLeft: 4 },
  input: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 16, 
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: '#ddd',
    ...typography.body,
  },
  footer: { gap: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.secondary, fontSize: 16 },
});

export default EmployeeFormScreen;