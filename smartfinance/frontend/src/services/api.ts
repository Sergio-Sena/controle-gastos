import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔑 Interceptor - Token:', token ? 'Existe' : 'Não existe');
  console.log('📡 Interceptor - URL:', config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header adicionado');
  } else {
    console.log('⚠️ Nenhum token encontrado');
  }
  return config;
});

// Interceptor de resposta para debug
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data).then(res => res.data),
  register: (data) => api.post('/auth/register', data).then(res => res.data),
};

export default api;