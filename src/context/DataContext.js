
// src/context/DataContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getItems } from '../services/itemService';
import { getTrucks } from '../services/truckService';
import { getMovements } from '../services/movementService';
import { checkIsAdmin, onAuthStateChanged } from '../services/authService';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // utilitários para atualização otimista (UI instantânea)
  const removeTruckFromState = (id) => {
      setTrucks(prev => prev.filter(t => t.id !== id));
  };

  const removeItemFromState = (id) => {
      setItems(prev => prev.filter(i => i.id !== id));
  };

  const refreshData = useCallback(async (onProgress) => {
    try {
      setLoading(true);
      console.log('--- Iniciando sincronização paralela (Supabase) ---');
      
      if (onProgress) onProgress(0.1, 'Iniciando sincronização...');

      const [
        adminResult,
        itemsResult,
        trucksResult,
        movementsResult
      ] = await Promise.all([
        checkIsAdmin(),
        getItems(),
        getTrucks(),
        getMovements()
      ]);

      if (onProgress) onProgress(0.8, 'Processando dados...');

      setIsAdmin(adminResult);
      
      const itemsList = itemsResult.success ? itemsResult.data : [];
      setItems(itemsList);
      
      setTrucks(trucksResult.success ? trucksResult.data : []);
      
      const movementsList = movementsResult.success ? movementsResult.data : [];
      setMovements(movementsList);

      const lowStock = itemsList.filter(item => item.needsRestock);
      setLowStockItems(lowStock);

      setLastUpdated(new Date());
      setHasInitialData(true);
      
      if (onProgress) onProgress(1.0, 'Pronto!');
      return true;
    } catch (error) {
      console.error('Erro na sincronização paralela:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
      if (!currentUser) {
        setItems([]);
        setTrucks([]);
        setMovements([]);
        setLowStockItems([]);
        setIsAdmin(false);
        setHasInitialData(false);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      trucks,
      movements,
      lowStockItems,
      isAdmin,
      loading,
      refreshData,
      removeTruckFromState, // 💡 Novo
      removeItemFromState,  // 💡 Novo
      lastUpdated,
      authInitialized,
      hasInitialData,
      user
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
