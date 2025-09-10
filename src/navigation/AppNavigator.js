// src/navigation/AppNavigator.js (versão simplificada)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import das telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FirstTimeSetupScreen from '../screens/FirstTimeSetupScreen';
import EmployeeFormScreen from '../screens/EmployeeFormScreen';
import ItemFormScreen from '../screens/ItemFormScreen'; // 👈 NOVO IMPORT

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Painel Principal' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Cadastrar Administrador' }}
        />
        <Stack.Screen 
          name="FirstTimeSetup" 
          component={FirstTimeSetupScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="EmployeeForm" 
        component={EmployeeFormScreen} 
        options={{ title: 'Cadastrar Funcionário' }} 
        />
        <Stack.Screen 
          name="ItemForm" 
          component={ItemFormScreen} 
          options={{ title: 'Cadastrar Item' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;