import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomRefreshControlProps {
  refreshing: boolean;
  size?: number;
}

export default function CustomRefreshControl({ 
  refreshing, 
  size = 40 
}: CustomRefreshControlProps) {
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Scale in animation
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();

      // Continuous rotation
      const rotateLoop = () => {
        rotateAnimation.setValue(0);
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start(() => {
          if (refreshing) rotateLoop();
        });
      };
      rotateLoop();

      // Pulse effect
      const pulseLoop = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (refreshing) pulseLoop();
        });
      };
      pulseLoop();
    } else {
      // Scale out animation
      Animated.spring(scaleAnimation, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [refreshing]);

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  if (!refreshing) return null;

  return (
    <View style={[styles.container, { width: size + 20, height: size + 20 }]}>
      {/* Pulse effect background */}
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            width: size + 20,
            height: size + 20,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.4)', 'rgba(108, 99, 255, 0.1)']}
          style={styles.pulseGradient}
        />
      </Animated.View>

      {/* Main refresh indicator */}
      <Animated.View
        style={[
          styles.refreshContainer,
          {
            width: size,
            height: size,
            transform: [
              { scale: scaleAnimation },
              { rotate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#8a7cff', '#6c63ff', '#5a52d5']}
          style={styles.iconContainer}
          locations={[0, 0.5, 1]}
        >
          <Ionicons 
            name="refresh" 
            size={size * 0.5} 
            color="#fff" 
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseContainer: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
  },
  pulseGradient: {
    flex: 1,
    borderRadius: 100,
  },
  refreshContainer: {
    borderRadius: 100,
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});