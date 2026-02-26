// Teste de Saúde da API
const BASE_URL = 'http://localhost:3000/api';

async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('🏥 Health Check:', data);
  } catch (error) {
    console.error('❌ Erro na API:', error.message);
  }
}

testHealth();