import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  style?: any;
}

export default function ThemeToggle({ size = 24, style }: ThemeToggleProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const rotateValue = useRef(new Animated.Value(theme === 'dark' ? 0 : 1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: theme === 'dark' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [theme]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation for feedback
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();

    toggleTheme();
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={handleToggle}
      accessible={true}
      accessibilityRole="switch"
      accessibilityState={{ checked: theme === 'light' }}
      accessibilityLabel={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      accessibilityHint="Toque duas vezes para alternar entre tema claro e escuro"
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ rotate: rotation }, { scale: scaleValue }],
          },
        ]}
      >
        <Ionicons
          name={theme === 'dark' ? 'moon' : 'sunny'}
          size={size}
          color={colors.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});