// src/navigation/AppNavigator.js (versão simplificada)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import das telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import EmployeeManagementScreen from '../screens/EmployeeManagementScreen';
import FirstTimeSetupScreen from '../screens/FirstTimeSetupScreen';
import EmployeeFormScreen from '../screens/EmployeeFormScreen';
import ItemFormScreen from '../screens/ItemFormScreen';
import ItemListScreen from '../screens/ItemListScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import EditItemScreen from '../screens/EditItemScreen';
import TruckFormScreen from '../screens/TruckFormScreen';
import TruckListScreen from '../screens/TruckListScreen';
import MovementScreen from '../screens/MovementScreen';
import MovementListScreen from '../screens/MovementListScreen';
import MovementDetailScreen from '../screens/MovementDetailScreen';
import StockReportScreen from '../screens/StockReportScreen';
import TruckDetailScreen from '../screens/TruckDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmployeeManagement" component={EmployeeManagementScreen} />
        <Stack.Screen name="FirstTimeSetup" component={FirstTimeSetupScreen} />
        <Stack.Screen name="EmployeeForm" component={EmployeeFormScreen} />
        <Stack.Screen name="ItemForm" component={ItemFormScreen} />
        <Stack.Screen name="ItemList" component={ItemListScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="EditItem" component={EditItemScreen} />
        <Stack.Screen name="TruckForm" component={TruckFormScreen} />
        <Stack.Screen name="TruckList" component={TruckListScreen} />
        <Stack.Screen name="Movements" component={MovementScreen} />
        <Stack.Screen name="MovementList" component={MovementListScreen} />
        <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
        <Stack.Screen name="StockReport" component={StockReportScreen} />
        <Stack.Screen name="TruckDetail" component={TruckDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;