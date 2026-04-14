
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/global';
import { createEmployee, updateEmployee } from '../services/employeeService';
import { registerEmployee } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; // 👈 Adicionado Ionicons
import { useData } from '../context/DataContext'; 

const EmployeeFormScreen = ({ navigation, route }) => {
  const { employee, mode } = route?.params || {};
  const isEdit = mode === 'edit';

  const { refreshData, isAdmin } = useData(); // 👈 Consumindo refreshData e isAdmin
  const [name, setName] = useState(isEdit ? employee.name : '');
  const [email, setEmail] = useState(isEdit ? employee.email : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [department, setDepartment] = useState(isEdit ? employee.department || '' : '');
  const [position, setPosition] = useState(isEdit ? employee.position || 'Operacional' : 'Operacional');
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
    if (isEdit) {
      if (!name) return Alert.alert('Erro', 'O nome é obrigatório');
      setLoading(true);
      try {
        const res = await updateEmployee(employee.id, { name, department, position });
        if (res.success) {
          await refreshData();
          Alert.alert('Sucesso', 'Funcionário atualizado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
          Alert.alert('Erro', res.error);
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao atualizar funcionário.');
      } finally {
        setLoading(false);
      }
      return;
    }

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

      await refreshData(); // 👈 Atualizando contexto (mesmo que não tenhamos lista de funcionários visível agora, é boa prática)

      Alert.alert('Sucesso', 'Funcionário cadastrado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar funcionário.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}</Text>
            <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="shield-half-outline" size={64} color={colors.error} style={{ marginBottom: 16 }} />
          <Text style={{ ...typography.headline, color: colors.error, textAlign: 'center', fontSize: 18 }}>
            Acesso Restrito
          </Text>
          <Text style={{ ...typography.body, color: colors.secondary, textAlign: 'center', marginTop: 8 }}>
            Apenas administradores podem acessar esta funcionalidade.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}</Text>
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
            <Text style={styles.label}>E-mail Corporativo {isEdit ? '' : '*'}</Text>
            <TextInput style={[styles.input, isEdit && { backgroundColor: '#f0f0f0', color: '#888' }]} placeholder="email@empresa.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isEdit} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departamento</Text>
            <TextInput style={styles.input} placeholder="Ex: Logística" value={department} onChangeText={setDepartment} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nível de Acesso (Cargo) *</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity 
                style={[styles.roleOption, position === 'Operacional' && styles.roleOptionActive]}
                onPress={() => setPosition('Operacional')}
              >
                <Text style={[styles.roleText, position === 'Operacional' && styles.roleTextActive]}>Operacional</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleOption, position === 'Admin' && styles.roleOptionActive]}
                onPress={() => setPosition('Admin')}
              >
                <Text style={[styles.roleText, position === 'Admin' && styles.roleTextActive]}>Administrador</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!isEdit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Segurança e Acesso</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha de Acesso *</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={[styles.input, { paddingRight: 50 }]} 
                  placeholder="••••••••" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword} 
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color={colors.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Senha *</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={[styles.input, { paddingRight: 50 }]} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  secureTextEntry={!showConfirmPassword} 
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color={colors.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <LinearGradient colors={[colors.primary, colors.primaryVariant]} style={styles.gradientButton}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isEdit ? 'Salvar Alterações' : 'Cadastrar Funcionário'}</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    height: 60, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: colors.surfaceVariant,
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
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: { gap: 12 },
  gradientButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonText: { ...typography.label, fontSize: 16, color: '#fff' },
  cancelButton: { height: 56, justifyContent: 'center', alignItems: 'center' },
  cancelText: { ...typography.label, color: colors.secondary, fontSize: 16 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleOption: { flex: 1, padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 16, alignItems: 'center', backgroundColor: '#fff' },
  roleOptionActive: { backgroundColor: colors.primaryVariant, borderColor: colors.primary },
  roleText: { ...typography.body, fontSize: 14, color: colors.secondary },
  roleTextActive: { color: '#fff', fontWeight: 'bold' },
});

export default EmployeeFormScreen;