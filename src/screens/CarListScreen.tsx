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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

import { Car, CarFilters } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';
import CarCard from '../components/CarCard';
import FilterModal from '../components/FilterModal';
import { CarListSkeleton } from '../components/SkeletonLoader';
import CustomRefreshControl from '../components/CustomRefreshControl';

type Props = NativeStackScreenProps<RootStackParamList, 'CarList'>;

export default function CarListScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CarFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const hasLoadedOnce = useRef(false);
  const lastLoadTime = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const cardPressScale = useRef(new Animated.Value(1)).current;
  const searchTimeout = useRef<NodeJS.Timeout>();

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
      const carsData = await CarService.getAllCars(!forceRefresh);
      setCars(carsData);
      setFilteredCars(carsData);
      hasLoadedOnce.current = true;
      lastLoadTime.current = now;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os carros. Dados podem estar desatualizados.');
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
      loadSearchHistory();
    }, [])
  );

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.log('Error loading search history:', error);
    }
  };

  const saveSearchQuery = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const updatedHistory = [
        query,
        ...searchHistory.filter(item => item !== query)
      ].slice(0, 10); // Keep only last 10 searches
      
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.log('Error saving search query:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('searchHistory');
    } catch (error) {
      console.log('Error clearing search history:', error);
    }
  };

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
    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      filterCars();
      if (searchQuery.length >= 2) {
        saveSearchQuery(searchQuery);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
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
        colors={[colors.background, colors.backgroundSecondary, colors.backgroundTertiary]} 
        style={styles.container}
        locations={[0, 0.6, 1]}
      >
        <LinearGradient 
          colors={[colors.cardBackground, colors.surfaceSecondary]} 
          style={styles.searchContainer}
        >
          <LinearGradient
            colors={[colors.surfaceSecondary, colors.surface]}
            style={styles.searchInputContainer}
          >
            <View style={styles.searchSkeletonContainer}>
              <View style={[styles.searchSkeleton, { backgroundColor: colors.border }]} />
            </View>
          </LinearGradient>
          <View style={[styles.filterButtonSkeleton, { backgroundColor: `${colors.primary}33`, borderColor: `${colors.primary}66` }]} />
        </LinearGradient>
        
        <View style={styles.listContainer}>
          <CarListSkeleton count={6} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={[colors.background, colors.backgroundSecondary, colors.backgroundTertiary]} 
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <LinearGradient 
        colors={[colors.cardBackground, colors.surfaceSecondary]} 
        style={styles.searchContainer}
      >
        <LinearGradient
          colors={[colors.surfaceSecondary, colors.surface]}
          style={styles.searchInputContainer}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por marca, modelo, placa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSearchHistory(searchHistory.length > 0)}
            onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
            placeholderTextColor={colors.textMuted}
            accessible={true}
            accessibilityLabel="Campo de busca"
            accessibilityHint="Digite para buscar carros por marca, modelo ou placa"
            accessibilityRole="search"
          />
        </LinearGradient>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(true);
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          accessibilityHint="Toque para abrir filtros de busca"
        >
          <Ionicons name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      {showSearchHistory && (
        <View style={styles.searchHistoryContainer}>
          <View style={styles.searchHistoryHeader}>
            <Text style={styles.searchHistoryTitle}>Pesquisas recentes</Text>
            <TouchableOpacity onPress={clearSearchHistory}>
              <Text style={styles.clearHistoryText}>Limpar</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.searchHistoryItem}
              onPress={() => {
                setSearchQuery(item);
                setShowSearchHistory(false);
              }}
            >
              <Ionicons name="time-outline" size={16} color="#7070a0" />
              <Text style={styles.searchHistoryText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.backgroundSecondary}
            titleColor={colors.text}
            title="Atualizando..."
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color={colors.textMuted} />
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
        <TouchableOpacity 
          style={styles.fabButton} 
          onPress={handleAddCar}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Adicionar novo carro"
          accessibilityHint="Toque para adicionar um novo carro"
        >
          <LinearGradient
            colors={[colors.primary, colors.primary, colors.primary]}
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
    borderRadius: 10,
    width: '60%',
  },
  filterButtonSkeleton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
  },
  searchHistoryContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  searchHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchHistoryTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearHistoryText: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchHistoryText: {
    color: '#b0b0c5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});