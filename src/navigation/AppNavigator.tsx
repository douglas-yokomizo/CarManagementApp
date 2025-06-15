import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CarListScreen from '../screens/CarListScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import CarFormScreen from '../screens/CarFormScreen';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';

// Stack navigator for Add Car tab
function AddCarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#2a2a40',
        },
        headerTintColor: '#ffffff',
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#2a2a40',
        },
        headerTintColor: '#ffffff',
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
        options={{ title: 'Meus Carros' }}
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
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#7070a0',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopWidth: 1,
          borderTopColor: '#2a2a40',
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

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6c63ff',
    background: '#0f0f23',
    card: '#1a1a2e',
    text: '#ffffff',
    border: '#2a2a40',
    notification: '#6c63ff',
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={customDarkTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}