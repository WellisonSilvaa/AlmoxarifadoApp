// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { globalStyles, colors } from '../styles/global';
import { auth } from '../services/firebase';
import { logoutUser } from '../services/authService';
import { testFirestoreConnection, checkCollections } from '../services/testeService';

const HomeScreen = ({ navigation }) => {

    const handleTestConnection = async () => {
        Alert.alert('Teste', 'Testando conexão com Firestore...');

        const result = await testFirestoreConnection();
        if (result.success) {
            Alert.alert('Sucesso', 'Conexão com Firestore funcionando!');
        } else {
            Alert.alert('Erro', `Falha na conexão: ${result.error}`);
        }
    };

    const user = auth.currentUser;

    const handleLogout = async () => {
        Alert.alert(
            "Sair",
            "Deseja realmente sair do sistema?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sair",
                    onPress: async () => {
                        const result = await logoutUser();
                        if (result.success) {
                            navigation.replace('Login');
                        } else {
                            Alert.alert('Erro', 'Não foi possível fazer logout');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Painel de Controle</Text>

            {user && (
                <View style={{
                    backgroundColor: colors.white,
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 20
                }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Usuário logado:</Text>
                    <Text>{user.displayName || user.email || user.password}</Text>
                </View>
            )}

            <Text style={{
                textAlign: 'center',
                marginBottom: 30,
                color: colors.dark
            }}>
                Sistema de Gestão de Almoxarifado
            </Text>

            {/* Cadastrar Funcionários */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.secondary }]}
                onPress={() => navigation.navigate('EmployeeForm')}
            >
                <Text style={globalStyles.buttonText}>Cadastrar Funcionários</Text>
            </TouchableOpacity>

            {/* Cadastrar Itens */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.warning }]}
                onPress={() => Alert.alert('Funcionalidade', 'Em desenvolvimento')}
            >
                <Text style={globalStyles.buttonText}>Cadastrar Itens</Text>
            </TouchableOpacity>

            {/* Cadastrar Carretas */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.dark }]}
                onPress={() => Alert.alert('Funcionalidade', 'Em desenvolvimento')}
            >
                <Text style={globalStyles.buttonText}>Cadastrar Carretas</Text>
            </TouchableOpacity>


            {/* Movimentações */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.primary }]}
                onPress={() => Alert.alert('Funcionalidade', 'Em desenvolvimento')}
            >
                <Text style={globalStyles.buttonText}>Movimentações</Text>
            </TouchableOpacity>

            {/* Sair do Sistema - Logout */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.danger, marginTop: 30 }]}
                onPress={handleLogout}
            >
                <Text style={globalStyles.buttonText}>Sair do Sistema</Text>
            </TouchableOpacity>

            {/* Cadastrar Administrador */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={globalStyles.buttonText}>Cadastrar Administrador</Text>
            </TouchableOpacity>

            {/* TESTE FIRESTORE */}
            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.warning }]}
                onPress={handleTestConnection}
            >
                <Text style={globalStyles.buttonText}>Testar Conexão Firestore</Text>
            </TouchableOpacity>

        </View>
    );
};

export default HomeScreen;