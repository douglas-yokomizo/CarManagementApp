import axios from "axios";

const API_BASE_URL = "https://carmanagement.loca.lt";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 404) {
      throw new Error("Recurso não encontrado");
    }
    if (error.response?.status >= 500) {
      throw new Error("Erro interno do servidor");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("Tempo limite da requisição excedido");
    }
    return Promise.reject(error);
  }
);

export default api;
