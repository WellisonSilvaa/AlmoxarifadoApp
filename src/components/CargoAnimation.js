import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const ANIMATION_DURATION = 3500;
const ITEM_COUNT = 3;

const CargoAnimation = () => {
  const shadowOpacity = useSharedValue(0.2);

  useEffect(() => {
    shadowOpacity.value = withRepeat(
      withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Box (Nova Caixa 3D do Usuário) */}
      <View style={styles.elementWrapper}>
        <View style={styles.originalImageContainer}>
            <Image 
                source={require('../../assets/caixa 3d.webp')} 
                style={styles.box3D}
                resizeMode="contain"
            />
        </View>
        <Animated.View style={[styles.baseShadow, { width: 50 }, animatedShadowStyle]} />
      </View>

      {/* Itens em movimento (Engrenagens 3D) */}
      {Array.from({ length: ITEM_COUNT }).map((_, index) => (
        <MovingItem key={index} delay={index * (ANIMATION_DURATION / ITEM_COUNT)} />
      ))}

      {/* Truck (Destino) */}
      <View style={styles.elementWrapper}>
        <View style={styles.truckContainer}>
          <View style={styles.truckTrailer}>
            <LinearGradient
              colors={['#b90014', '#7a000d']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.truckDetailLine} />
          </View>
          <View style={styles.truckCabin}>
             <View style={styles.cabinTop} />
             <View style={styles.truckWindow}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={StyleSheet.absoluteFill}
                  opacity={0.6}
                />
             </View>
          </View>
          <View style={styles.wheelGroup}>
            {[10, 35, 60].map(left => (
              <View key={left} style={[styles.wheel, { left }]} />
            ))}
          </View>
        </View>
        <Animated.View style={[styles.baseShadow, { width: 70 }, animatedShadowStyle]} />
      </View>
    </View>
  );
};

const MovingItem = ({ delay }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { 
          duration: ANIMATION_DURATION, 
          easing: Easing.bezier(0.4, 0, 0.2, 1) 
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Sair de dentro da caixa (x inicial em 45, y inicial um pouco mais alto para sair da 'boca')
    const translateX = interpolate(progress.value, [0, 1], [40, 210]);
    const translateY = interpolate(progress.value, [0, 0.45, 1], [-10, -75, 0]);
    const rotate = interpolate(progress.value, [0, 1], [0, 360]); // Girar engrenagem
    const opacity = interpolate(progress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    const scale = interpolate(progress.value, [0, 0.1, 0.9, 1], [0.3, 0.8, 0.8, 0.3]);

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale }
      ],
      opacity,
      zIndex: -1, 
    };
  });

  return (
    <Animated.View style={[styles.item, animatedStyle]}>
        <Image 
            source={require('../../assets/engreangem 3d.png')} 
            style={styles.itemImage}
            resizeMode="contain"
        />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  elementWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  originalImageContainer: {
    width: 75,
    height: 75,
    zIndex: 10,
  },
  box3D: {
    width: '100%',
    height: '100%',
  },
  truckContainer: {
    width: 90,
    height: 55,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  truckTrailer: {
    width: 65,
    height: 45,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  truckDetailLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
  },
  truckCabin: {
    width: 25,
    height: 32,
    backgroundColor: '#333',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 4,
    position: 'relative',
    marginLeft: -2,
  },
  cabinTop: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  truckWindow: {
    width: 14,
    height: 14,
    position: 'absolute',
    top: 6,
    right: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  wheelGroup: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 14,
  },
  wheel: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#111',
    borderWidth: 3,
    borderColor: '#333',
  },
  baseShadow: {
    marginTop: 5,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    transform: [{ scaleX: 1.2 }], // Sombras mais largas para assets 3D
  },
  item: {
    position: 'absolute',
    left: 0,
    top: 65,
    width: 35,
    height: 35,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  }
});

export default CargoAnimation;
