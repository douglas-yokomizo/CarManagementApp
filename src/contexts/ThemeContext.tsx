import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'dark' | 'light';

interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSecondary: string;
  success: string;
  error: string;
  warning: string;
  cardBackground: string;
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
}

const darkTheme: ThemeColors = {
  background: '#0f0f23',
  backgroundSecondary: '#1a1a2e',
  backgroundTertiary: '#16213e',
  surface: 'rgba(26, 26, 46, 0.6)',
  surfaceSecondary: 'rgba(22, 33, 62, 0.8)',
  primary: '#6c63ff',
  secondary: '#4ecdc4',
  accent: '#ff6b6b',
  text: '#ffffff',
  textSecondary: '#b0b0c5',
  textMuted: '#7070a0',
  border: 'rgba(255, 255, 255, 0.15)',
  borderSecondary: 'rgba(255, 255, 255, 0.1)',
  success: '#4ecdc4',
  error: '#ff6b6b',
  warning: '#ffa726',
  cardBackground: 'rgba(26, 26, 46, 0.95)',
  gradientStart: '#0f0f23',
  gradientMiddle: '#1a1a2e',
  gradientEnd: '#16213e',
};

const lightTheme: ThemeColors = {
  background: '#f5f7fa',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#e8ecf3',
  surface: 'rgba(255, 255, 255, 0.9)',
  surfaceSecondary: 'rgba(248, 250, 252, 0.8)',
  primary: '#6c63ff',
  secondary: '#4ecdc4',
  accent: '#ff6b6b',
  text: '#1a1a2e',
  textSecondary: '#4a5568',
  textMuted: '#718096',
  border: 'rgba(0, 0, 0, 0.1)',
  borderSecondary: 'rgba(0, 0, 0, 0.05)',
  success: '#4ecdc4',
  error: '#ff6b6b',
  warning: '#ffa726',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  gradientStart: '#f5f7fa',
  gradientMiddle: '#ffffff',
  gradientEnd: '#e8ecf3',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { darkTheme, lightTheme };