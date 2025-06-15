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

  const renderCarItem = ({ item }: { item: Car }) => (
    <CarCard car={item} onPress={() => handleCarPress(item)} />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando carros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, placa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#2196F3" />
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
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum carro encontrado</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCar}>
              <Text style={styles.addButtonText}>Adicionar primeiro carro</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddCar}>
        <Ionicons name="add" size={24} color="#fff" />
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#666',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});