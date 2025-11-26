// src/screens/EmployeeFormScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { createEmployee } from '../services/employeeService';
import { registerEmployee } from '../services/authService';

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

    // Senha é sempre obrigatória para funcionários fazerem login
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
      // Primeiro criar o funcionário no Firestore
      const employeeResult = await createEmployee({ 
        name, 
        email, 
        department, 
        position 
      });

      if (!employeeResult.success) {
        Alert.alert('Erro', employeeResult.error);
        setLoading(false);
        return;
      }

      console.log('Funcionário criado no Firestore com sucesso, ID:', employeeResult.id);

      // Sempre criar conta de autenticação para o funcionário poder fazer login
      const authResult = await registerEmployee(
        email, 
        password, 
        name, 
        employeeResult.id
      );

      if (!authResult.success) {
        // Se falhar ao criar a conta, mostrar erro mais específico
        console.error('Erro ao criar conta de autenticação:', authResult.error);
        
        // Mostrar alerta com opção de continuar ou cancelar
        Alert.alert(
          'Atenção - Conta Não Criada', 
          `Não foi possível criar a conta de acesso:\n\n${authResult.error}\n\nO funcionário foi cadastrado no sistema, mas não poderá fazer login até que uma conta seja criada.\n\nPossíveis causas:\n• Email já está em uso\n• Problema de conexão\n• Senha muito fraca\n\nDeseja tentar novamente com outro email?`,
          [
            {
              text: 'Voltar',
              style: 'cancel',
              onPress: () => navigation.goBack()
            },
            {
              text: 'Tentar Novamente',
              onPress: () => {
                // Limpar campos de senha para o usuário tentar novamente
                setPassword('');
                setConfirmPassword('');
              }
            }
          ]
        );
        setLoading(false);
        return;
      }

      console.log('Conta de autenticação criada com sucesso');

      Alert.alert(
        'Sucesso', 
        'Funcionário cadastrado com sucesso! Ele já pode fazer login no sistema usando o email e senha cadastrados.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Erro inesperado ao cadastrar funcionário:', error);
      Alert.alert(
        'Erro', 
        `Ocorreu um erro inesperado ao cadastrar funcionário: ${error.message || 'Erro desconhecido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Cadastrar Funcionário</Text>

        <TextInput 
          style={globalStyles.input} 
          placeholder="Nome*" 
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Email*" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Departamento" 
          value={department} 
          onChangeText={setDepartment} 
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Cargo" 
          value={position} 
          onChangeText={setPosition} 
        />

        {/* Divisor visual */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.light,
          marginVertical: 20,
          paddingTop: 15
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.dark,
            marginBottom: 10
          }}>
            Credenciais de Acesso *
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.gray,
            marginBottom: 15
          }}>
            O funcionário usará essas credenciais para fazer login no sistema
          </Text>
        </View>

        <TextInput 
          style={globalStyles.input} 
          placeholder="Senha (mínimo 6 caracteres) *" 
          value={password} 
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <TextInput 
          style={globalStyles.input} 
          placeholder="Confirmar senha *" 
          value={confirmPassword} 
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity 
          style={globalStyles.button} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Cadastrar Funcionário</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EmployeeFormScreen;