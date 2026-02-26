const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPluggyAPI() {
  console.log('🧪 TESTE COMPLETO DA API PLUGGY');
  console.log('================================');
  
  try {
    // Primeiro, fazer login para obter token
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@test.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login OK - Token obtido');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Teste 2: Connect Token
    console.log('\n2️⃣ Testando connect token...');
    const connectTokenResponse = await axios.get(`${BASE_URL}/pluggy/connect-token`, { headers });
    console.log('✅ Connect Token:', connectTokenResponse.data.connectToken ? 'Gerado' : 'Falhou');
    
    // Teste 3: Conectores
    console.log('\n3️⃣ Testando conectores...');
    const connectorsResponse = await axios.get(`${BASE_URL}/pluggy/connectors`, { headers });
    const connectors = connectorsResponse.data.connectors;
    console.log(`✅ Conectores: ${connectors.length} bancos encontrados`);
    
    // Mostrar alguns bancos
    console.log('\n🏦 Primeiros 5 bancos:');
    connectors.slice(0, 5).forEach(bank => {
      console.log(`   - ${bank.name} (ID: ${bank.id})`);
    });
    
    // Teste 4: Items (conexões existentes)
    console.log('\n4️⃣ Testando items...');
    const itemsResponse = await axios.get(`${BASE_URL}/pluggy/items`, { headers });
    const items = itemsResponse.data.items;
    console.log(`✅ Items: ${items.length} conexões existentes`);
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ API Pluggy está funcionando perfeitamente');
    console.log('\n📱 Agora você pode testar no frontend em: http://localhost:5173/');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('\n💡 DICA: Crie uma conta no frontend primeiro!');
    }
  }
}

testPluggyAPI();