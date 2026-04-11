// App.js
import React, { useState, useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AppNavigator from './src/navigation/AppNavigator';
import { View } from 'react-native';
import CustomSplashScreen from './src/components/CustomSplashScreen';

// Manter a splash screen nativa visível até estarmos prontos
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

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
        // Simulação de carregamento de recursos/progresso
        for (let i = 0; i <= 100; i += 5) {
          setProgress(i / 100);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (fontsLoaded) {
          setAppIsReady(true);
        }
      }
    }

    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    async function hideNativeSplash() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hideNativeSplash();
  }, [fontsLoaded]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1 }}>
        <CustomSplashScreen progress={progress} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
    </View>
  );
}