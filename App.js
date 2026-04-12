
import React, { useState, useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import { View } from 'react-native';
import CustomSplashScreen from './src/components/CustomSplashScreen';
import { DataProvider, useData } from './src/context/DataContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Manter a splash screen nativa visível até estarmos prontos
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Inicializando...');
  const { refreshData, user: contextUser, authInitialized, hasInitialData } = useData();

  const [fontsLoaded] = useFonts({
    'Manrope_400Regular': Manrope_400Regular,
    'Manrope_600SemiBold': Manrope_600SemiBold,
    'Manrope_700Bold': Manrope_700Bold,
    'Manrope_800ExtraBold': Manrope_800ExtraBold,
    'Inter_400Regular': Inter_400Regular,
    'Inter_500Medium': Inter_500Medium,
    'Inter_600SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (!fontsLoaded || !authInitialized) return;
        
        // Se estiver logado e ainda NÃO buscou dados, força a volta da splash e busca
        if (contextUser && !hasInitialData) {
          setAppIsReady(false);
          setStatusMessage('Sincronizando dados...');
          await refreshData((p, msg) => {
            setProgress(0.2 + (p * 0.8));
            setStatusMessage(msg);
          });
        }
        
        setProgress(1.0);
        setStatusMessage('Tudo pronto!');

      } catch (e) {
        console.warn('Erro na inicialização:', e);
      } finally {
        if (fontsLoaded && authInitialized && (!contextUser || hasInitialData)) {
          setTimeout(() => {
            setAppIsReady(true);
            SplashScreen.hideAsync();
          }, 350);
        }
      }
    }

    prepare();
  }, [fontsLoaded, authInitialized, contextUser, hasInitialData]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1 }}>
        <CustomSplashScreen progress={progress} statusMessage={statusMessage} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </SafeAreaProvider>
  );
}