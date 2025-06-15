import { Car, CarFormData, CarFilters } from '../types/Car';
import api from './apiConfig';
import CacheService from './cacheService';

export class CarService {
  private static readonly ENDPOINT = '/cars';

  static async getAllCars(useCache: boolean = true): Promise<Car[]> {
    // Try cache first
    if (useCache) {
      const cachedCars = await CacheService.getCars();
      if (cachedCars) {
        return cachedCars;
      }
    }

    try {
      const response = await api.get<Car[]>(this.ENDPOINT);
      const cars = response.data;
      
      // Cache the result
      await CacheService.setCars(cars);
      return cars;
    } catch (error) {
      // If network fails, try to return cached data even if expired
      const cachedCars = await CacheService.getCars();
      if (cachedCars) {
        console.log('Network failed, using cached data');
        return cachedCars;
      }
      throw error;
    }
  }

  static async getCarById(id: string, useCache: boolean = true): Promise<Car> {
    // Try cache first
    if (useCache) {
      const cachedCar = await CacheService.getCar(id);
      if (cachedCar) {
        return cachedCar;
      }
    }

    try {
      const response = await api.get<Car>(`${this.ENDPOINT}/${id}`);
      const car = response.data;
      
      // Cache the result
      await CacheService.setCar(car);
      return car;
    } catch (error) {
      // If network fails, try to return cached data
      const cachedCar = await CacheService.getCar(id);
      if (cachedCar) {
        console.log('Network failed, using cached car data');
        return cachedCar;
      }
      throw error;
    }
  }

  static async createCar(carData: CarFormData): Promise<Car> {
    const newCar = {
      ...carData,
      id: Date.now().toString(),
    };
    
    try {
      const response = await api.post<Car>(this.ENDPOINT, newCar);
      const car = response.data;
      
      // Invalidate cache since we added a new car
      await CacheService.remove('cars');
      await CacheService.setCar(car);
      
      return car;
    } catch (error) {
      // Store in pending operations for when network is back
      console.log('Failed to create car, will retry when online');
      throw error;
    }
  }

  static async updateCar(id: string, carData: Partial<CarFormData>): Promise<Car> {
    try {
      const response = await api.put<Car>(`${this.ENDPOINT}/${id}`, carData);
      const car = response.data;
      
      // Update cache
      await CacheService.setCar(car);
      await CacheService.remove('cars'); // Invalidate cars list
      
      return car;
    } catch (error) {
      console.log('Failed to update car, will retry when online');
      throw error;
    }
  }

  static async deleteCar(id: string): Promise<void> {
    try {
      await api.delete(`${this.ENDPOINT}/${id}`);
      
      // Remove from cache
      await CacheService.removeCar(id);
      await CacheService.remove('cars'); // Invalidate cars list
    } catch (error) {
      console.log('Failed to delete car, will retry when online');
      throw error;
    }
  }

  static async searchCars(filters: CarFilters): Promise<Car[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.marca) {
        params.append('marca_like', filters.marca);
      }
      if (filters.ano !== undefined && filters.ano !== null && !isNaN(filters.ano)) {
        params.append('ano', filters.ano.toString());
      }
      if (filters.cor) {
        params.append('cor_like', filters.cor);
      }

      const response = await api.get<Car[]>(`${this.ENDPOINT}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error in searchCars:', error);
      console.error('Filters received:', filters);
      throw error;
    }
  }
}