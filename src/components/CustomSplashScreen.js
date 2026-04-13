import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import CargoAnimation from './CargoAnimation';

const { width } = Dimensions.get('window');

const CustomSplashScreen = ({ progress = 0, statusMessage = "Inicializando Sistemas..." }) => {
  const animatedProgress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#ffffff', '#f3f4f5']}
        style={styles.background}
      />

      {/* Decorative Top Line */}
      <LinearGradient
        colors={['#b90014', '#e31b23']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topLine}
      />

      <View style={styles.centerContent}>
        {/* Animation Container */}
        <View style={styles.animationWrapper}>
          <CargoAnimation />
        </View>

        {/* Brand Typography */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Almoxarifado <Text style={styles.highlight}>Pro</Text>
          </Text>
          <Text style={styles.subtitle}>INTELLIGENT INVENTORY CONTROL</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
              <LinearGradient
                colors={['#b90014', '#e31b23']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Text style={styles.loadingText}>{statusMessage}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLineContainer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>POWERED BY PRECISION LOGISTICS</Text>
          <View style={styles.footerLine} />
        </View>
        <Text style={styles.versionText}>VERSION 2.4.0 • HIGH PERFORMANCE ARCHITECTURE</Text>
      </View>

      {/* Background Glows */}
      <View style={[styles.glow, styles.glowBottomRight]} />
      <View style={[styles.glow, styles.glowTopLeft]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  animationWrapper: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140, // Espaço dedicado para a carreta e caixa
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#191c1d',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -1,
  },
  highlight: {
    color: '#b90014',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#474747',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 3,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  progressBarBg: {
    width: 192,
    height: 6,
    backgroundColor: '#e7e8e9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(95, 94, 94, 0.6)',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    paddingBottom: 48,
    alignItems: 'center',
    zIndex: 10,
  },
  footerLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerLine: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(231, 189, 184, 0.3)',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#474747',
    marginHorizontal: 12,
    letterSpacing: 1,
    fontFamily: 'Inter_600SemiBold',
  },
  versionText: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(95, 94, 94, 0.4)',
    letterSpacing: -0.2,
    fontFamily: 'Inter_500Medium',
  },
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
  },
  glowBottomRight: {
    bottom: '-10%',
    right: '-10%',
    backgroundColor: 'rgba(185, 0, 20, 0.05)',
  },
  glowTopLeft: {
    top: '-10%',
    left: '-10%',
    backgroundColor: 'rgba(95, 94, 94, 0.05)',
  },
});

export default CustomSplashScreen;
