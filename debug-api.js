// Debug da API
const BASE_URL = 'http://localhost:3000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OWY4N2QyODY2MGNjMzU4MjY1ZTJlYiIsImlhdCI6MTc3MjA2MjY3NCwiZXhwIjoxNzcyNjY3NDc0fQ.d8RGwy_4UrcyVqteaVV8iSxzq3s-aTvfWRvka2vlkSo';

async function debugAPI() {
  try {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

debugAPI();