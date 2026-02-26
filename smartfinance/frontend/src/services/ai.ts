import api from './api';

export const aiAPI = {
  analyze: () => {
    console.log('📡 aiAPI.analyze() chamado');
    console.log('🔑 Token no localStorage:', localStorage.getItem('token') ? 'Existe' : 'Não existe');
    return api.get('/ai/analyze').then(res => {
      console.log('✅ Resposta da API:', res.data);
      return res.data;
    }).catch(err => {
      console.error('❌ Erro na API:', err.response?.data || err.message);
      throw err;
    });
  },
};