import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CarListScreen from '../screens/CarListScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import CarFormScreen from '../screens/CarFormScreen';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';

// Wrapper component for tab navigation
function AddCarTab({ navigation }: any) {
  return <CarFormScreen navigation={navigation} route={{ params: {} } as any} />;
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
          title: route.params?.car ? 'Editar Carro' : 'Novo Carro'
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
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
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
        component={AddCarTab}
        options={{ title: 'Adicionar' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}