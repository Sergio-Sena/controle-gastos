import api from './api';

export const pluggyAPI = {
  getConnectToken: () => api.get('/pluggy/connect-token').then(res => res.data),
  getConnectors: () => api.get('/pluggy/connectors').then(res => res.data),
  getItems: () => api.get('/pluggy/items').then(res => res.data),
  getAccounts: (itemId: string) => api.get(`/pluggy/accounts/${itemId}`).then(res => res.data),
  connectBank: (connectorId: string) => api.post('/pluggy/connect', { connectorId }).then(res => res.data),
  syncTransactions: (data: { itemId: string; accountId: string; days?: number }) => 
    api.post('/pluggy/sync-transactions', data).then(res => res.data),
  deleteItem: (itemId: string) => api.delete(`/pluggy/items/${itemId}`).then(res => res.data),
};