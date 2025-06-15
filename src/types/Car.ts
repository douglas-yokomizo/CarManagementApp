export interface Car {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  imagem: string;
}

export interface CarFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  imagem: string;
}

export interface CarFilters {
  marca?: string;
  ano?: number;
  cor?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
}