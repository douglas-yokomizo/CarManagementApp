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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Car, CarFilters } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';
import CarCard from '../components/CarCard';
import FilterModal from '../components/FilterModal';

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
    navigation.navigate('CarDetail', { carId: car.id });
  };

  const handleAddCar = () => {
    navigation.navigate('CarForm', {});
  };

  const clearFilters = () => {
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Carregando carros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#a0a0b5" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, placa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#7070a0"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#6c63ff" />
        </TouchableOpacity>
      </View>

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

      <TouchableOpacity style={styles.fab} onPress={handleAddCar}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FilterModal
        visible={showFilters}
        filters={filters}
        onApplyFilters={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </View>
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
    color: '#a0a0b5',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    paddingTop: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  filterButton: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#2a2a40',
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
    fontSize: 18,
    color: '#7070a0',
    marginTop: 16,
    marginBottom: 32,
    fontWeight: '600',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});