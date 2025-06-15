import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Car, CarFilters } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';
import CarCard from '../components/CarCard';
import FilterModal from '../components/FilterModal';
import { CarListSkeleton } from '../components/SkeletonLoader';
import CustomRefreshControl from '../components/CustomRefreshControl';

type Props = NativeStackScreenProps<RootStackParamList, 'CarList'>;

export default function CarListScreen({ navigation, route }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CarFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const hasLoadedOnce = useRef(false);
  const lastLoadTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const cardPressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animation for FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(fabAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const loadCars = async (forceRefresh = false) => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTime.current;
    
    // Skip loading if data is cached and not forcing refresh
    if (!forceRefresh && hasLoadedOnce.current && timeSinceLastLoad < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const carsData = await CarService.getAllCars();
      setCars(carsData);
      setFilteredCars(carsData);
      hasLoadedOnce.current = true;
      lastLoadTime.current = now;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os carros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadCars(true); // Force refresh when pulling to refresh
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      // Only load cars if we haven't loaded them yet or cache has expired
      loadCars();
    }, [])
  );

  // Listen for navigation params to detect when refresh is needed
  useEffect(() => {
    const params = route.params;
    if (params?.shouldRefresh) {
      hasLoadedOnce.current = false;
      // Clear the param to avoid unnecessary refreshes
      navigation.setParams({ shouldRefresh: false });
    }
  }, [route.params, navigation]);

  useEffect(() => {
    filterCars();
  }, [searchQuery, filters, cars]);

  const filterCars = () => {
    let filtered = cars;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car =>
        car.marca.toLowerCase().includes(query) ||
        car.modelo.toLowerCase().includes(query) ||
        car.placa.toLowerCase().includes(query) ||
        car.cor.toLowerCase().includes(query)
      );
    }

    if (filters.marca) {
      filtered = filtered.filter(car =>
        car.marca.toLowerCase().includes(filters.marca!.toLowerCase())
      );
    }

    if (filters.ano !== undefined && filters.ano !== null) {
      filtered = filtered.filter(car => car.ano === filters.ano);
    }

    if (filters.cor) {
      filtered = filtered.filter(car =>
        car.cor.toLowerCase().includes(filters.cor!.toLowerCase())
      );
    }

    setFilteredCars(filtered);
  };

  const handleCarPress = (car: Car) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Bounce animation for feedback
    Animated.sequence([
      Animated.spring(cardPressScale, {
        toValue: 0.98,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(cardPressScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    
    navigation.navigate('CarDetail', { carId: car.id });
  };

  const handleAddCar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the AddCar tab instead of within the current stack
    navigation.getParent()?.navigate('AddCar');
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({});
    setSearchQuery('');
  };

  const handleEditCar = (car: Car) => {
    navigation.navigate('CarForm', { car });
  };

  const handleDeleteCar = async (car: Car) => {
    try {
      await CarService.deleteCar(car.id);
      
      // Update the local state immediately
      const updatedCars = cars.filter(c => c.id !== car.id);
      setCars(updatedCars);
      setFilteredCars(prev => prev.filter(c => c.id !== car.id));
      
      // Optionally show success message without blocking UI
      setTimeout(() => {
        Alert.alert('Sucesso', `${car.marca} ${car.modelo} foi excluído com sucesso!`);
      }, 300);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o carro');
      console.error(error);
    }
  };

  const renderCarItem = ({ item }: { item: Car }) => (
    <CarCard 
      car={item} 
      onPress={() => handleCarPress(item)}
      onEdit={handleEditCar}
      onDelete={handleDeleteCar}
    />
  );

  if (loading) {
    return (
      <LinearGradient 
        colors={['#0f0f23', '#1a1a2e', '#16213e']} 
        style={styles.container}
        locations={[0, 0.6, 1]}
      >
        <LinearGradient 
          colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.9)']} 
          style={styles.searchContainer}
        >
          <LinearGradient
            colors={['rgba(22, 33, 62, 0.8)', 'rgba(42, 42, 64, 0.6)']}
            style={styles.searchInputContainer}
          >
            <View style={styles.searchSkeletonContainer}>
              <View style={styles.searchSkeleton} />
            </View>
          </LinearGradient>
          <View style={styles.filterButtonSkeleton} />
        </LinearGradient>
        
        <View style={styles.listContainer}>
          <CarListSkeleton count={6} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={['#0f0f23', '#1a1a2e', '#16213e']} 
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <LinearGradient 
        colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.9)']} 
        style={styles.searchContainer}
      >
        <LinearGradient
          colors={['rgba(22, 33, 62, 0.8)', 'rgba(42, 42, 64, 0.6)']}
          style={styles.searchInputContainer}
        >
          <Ionicons name="search" size={20} color="#a0a0b5" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, placa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#7070a0"
          />
        </LinearGradient>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(true);
          }}
        >
          <Ionicons name="filter" size={20} color="#6c63ff" />
        </TouchableOpacity>
      </LinearGradient>

      {(Object.keys(filters).length > 0 || searchQuery) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {filteredCars.length} de {cars.length} carros
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredCars}
        renderItem={renderCarItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6c63ff']}
            tintColor="#6c63ff"
            progressBackgroundColor="#1a1a2e"
            titleColor="#ffffff"
            title="Atualizando..."
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#4a4a6a" />
            <Text style={styles.emptyText}>Nenhum carro encontrado</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCar}>
              <Text style={styles.addButtonText}>Adicionar primeiro carro</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{
              translateY: fabAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity style={styles.fabButton} onPress={handleAddCar}>
          <LinearGradient
            colors={['#8a7cff', '#6c63ff', '#5a52d5']}
            style={styles.fabGradient}
            locations={[0, 0.5, 1]}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <FilterModal
        visible={showFilters}
        filters={filters}
        onApplyFilters={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#c0c0d0',
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    paddingTop: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterButton: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    backdropFilter: 'blur(20px)',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a40',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#a0a0b5',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#6c63ff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    color: '#9090b0',
    marginTop: 16,
    marginBottom: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 68,
    height: 68,
    borderRadius: 34,
    elevation: 16,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 34,
  },
  searchSkeletonContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  searchSkeleton: {
    height: 20,
    backgroundColor: 'rgba(112, 112, 160, 0.3)',
    borderRadius: 10,
    width: '60%',
  },
  filterButtonSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
});