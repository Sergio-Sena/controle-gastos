import api from './api';

export const transactionAPI = {
  getAll: () => api.get('/transactions').then(res => res.data),
  create: (data) => api.post('/transactions', data).then(res => res.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/transactions/${id}`).then(res => res.data),
};