import { Car, CarFormData, CarFilters } from '../types/Car';
import api from './apiConfig';

export class CarService {
  private static readonly ENDPOINT = '/cars';

  static async getAllCars(): Promise<Car[]> {
    const response = await api.get<Car[]>(this.ENDPOINT);
    return response.data;
  }

  static async getCarById(id: string): Promise<Car> {
    const response = await api.get<Car>(`${this.ENDPOINT}/${id}`);
    return response.data;
  }

  static async createCar(carData: CarFormData): Promise<Car> {
    const newCar = {
      ...carData,
      id: Date.now().toString(),
    };
    const response = await api.post<Car>(this.ENDPOINT, newCar);
    return response.data;
  }

  static async updateCar(id: string, carData: Partial<CarFormData>): Promise<Car> {
    const response = await api.put<Car>(`${this.ENDPOINT}/${id}`, carData);
    return response.data;
  }

  static async deleteCar(id: string): Promise<void> {
    await api.delete(`${this.ENDPOINT}/${id}`);
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