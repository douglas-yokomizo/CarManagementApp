import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

import CarListScreen from '../screens/CarListScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import CarFormScreen from '../screens/CarFormScreen';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';
import ThemeToggle from '../components/ThemeToggle';

// Stack navigator for Add Car tab
function AddCarStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CarForm" 
        component={CarFormScreen}
        options={{ title: 'Novo Carro' }}
        initialParams={{}}
      />
    </Stack.Navigator>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function HomeStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="CarList" 
        component={CarListScreen}
        options={{ 
          title: 'Meus Carros',
          headerRight: () => <ThemeToggle style={{ marginRight: 8 }} />
        }}
      />
      <Stack.Screen 
        name="CarDetail" 
        component={CarDetailScreen}
        options={{ title: 'Detalhes do Carro' }}
      />
      <Stack.Screen 
        name="CarForm" 
        component={CarFormScreen}
        options={({ route }) => ({
          title: (route.params && route.params.car) ? 'Editar Carro' : 'Novo Carro'
        })}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'AddCar') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Carros' }}
      />
      <Tab.Screen 
        name="AddCar" 
        component={AddCarStack}
        options={{ title: 'Adicionar', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme, colors } = useTheme();
  
  const customTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.backgroundSecondary,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.backgroundSecondary} />
      <NavigationContainer theme={customTheme}>
        <TabNavigator />
      </NavigationContainer>
    </>
  );
}