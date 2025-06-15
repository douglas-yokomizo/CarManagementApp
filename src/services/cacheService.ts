import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car } from '../types/Car';

interface CacheData<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  static async set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRY): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      
      await AsyncStorage.setItem(
        this.CACHE_PREFIX + key,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.log('Cache set error:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now - cacheData.timestamp > cacheData.expiresIn) {
        await this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.log('Cache get error:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.log('Cache remove error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.log('Cache clear error:', error);
    }
  }

  // Car-specific cache methods
  static async setCars(cars: Car[]): Promise<void> {
    await this.set('cars', cars, 10 * 60 * 1000); // 10 minutes for cars
  }

  static async getCars(): Promise<Car[] | null> {
    return this.get<Car[]>('cars');
  }

  static async setCar(car: Car): Promise<void> {
    await this.set(`car_${car.id}`, car, 15 * 60 * 1000); // 15 minutes for individual car
  }

  static async getCar(carId: string): Promise<Car | null> {
    return this.get<Car>(`car_${carId}`);
  }

  static async removeCar(carId: string): Promise<void> {
    await this.remove(`car_${carId}`);
  }
}

export default CacheService;