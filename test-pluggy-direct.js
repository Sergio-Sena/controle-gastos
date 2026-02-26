const axios = require('axios');
require('dotenv').config({ path: './smartfinance/backend/.env' });

async function testPluggyDirect() {
  console.log('🔍 Testando Pluggy API diretamente...\n');
  
  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  const baseURL = process.env.PLUGGY_BASE_URL;
  
  console.log('📋 Configurações:');
  console.log('Base URL:', baseURL);
  console.log('Client ID:', clientId ? 'Configurado' : 'NÃO CONFIGURADO');
  console.log('Client Secret:', clientSecret ? 'Configurado' : 'NÃO CONFIGURADO');
  console.log('');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Credenciais não configuradas!');
    return;
  }
  
  try {
    // Teste 1: Autenticação
    console.log('🔐 Teste 1: Autenticação...');
    const authResponse = await axios.post(`${baseURL}/auth`, {
      clientId,
      clientSecret
    });
    
    console.log('✅ Autenticação bem-sucedida!');
    console.log('Access Token:', authResponse.data.accessToken ? 'Recebido' : 'NÃO RECEBIDO');
    
    const accessToken = authResponse.data.accessToken;
    
    // Teste 2: Conectores
    console.log('\n🏦 Teste 2: Buscando conectores...');
    const connectorsResponse = await axios.get(`${baseURL}/connectors`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const connectors = connectorsResponse.data.results.filter(c => 
      c.country === 'BR' && c.type === 'PERSONAL_BANK'
    );
    
    console.log(`✅ ${connectors.length} conectores brasileiros encontrados!`);
    console.log('Primeiros 3 bancos:');
    connectors.slice(0, 3).forEach(c => {
      console.log(`  - ${c.name} (${c.id})`);
    });
    
    // Teste 3: Items (sem clientUserId específico)
    console.log('\n📋 Teste 3: Buscando items...');
    const itemsResponse = await axios.get(`${baseURL}/items`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${itemsResponse.data.results.length} items encontrados!`);
    
    console.log('\n🎉 Todos os testes passaram! Pluggy API está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.status, error.response?.statusText);
    console.error('Detalhes:', error.response?.data || error.message);
  }
}

testPluggyDirect();