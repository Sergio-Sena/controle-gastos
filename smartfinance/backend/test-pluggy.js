const pluggyService = require('./services/pluggyService');

async function testPluggyConnection() {
  console.log('🧪 TESTE DE CONEXÃO PLUGGY');
  console.log('================================');
  
  try {
    // Teste 1: Autenticação
    console.log('\n1️⃣ Testando autenticação...');
    const token = await pluggyService.authenticate();
    console.log('✅ Autenticação OK - Token:', token ? 'Recebido' : 'Falhou');
    
    // Teste 2: Listar conectores
    console.log('\n2️⃣ Testando conectores...');
    const connectors = await pluggyService.getConnectors();
    console.log(`✅ Conectores OK - ${connectors.length} bancos encontrados`);
    
    // Mostrar alguns bancos
    console.log('\n🏦 Bancos disponíveis:');
    connectors.slice(0, 5).forEach(bank => {
      console.log(`   - ${bank.name} (${bank.id})`);
    });
    
    // Teste 3: Criar connect token
    console.log('\n3️⃣ Testando connect token...');
    const connectToken = await pluggyService.createConnectToken('test-user-123');
    console.log('✅ Connect Token OK:', connectToken ? 'Gerado' : 'Falhou');
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Pluggy está funcionando corretamente');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    console.log('\n🔍 DIAGNÓSTICO:');
    if (error.message.includes('ENOTFOUND')) {
      console.log('❌ Problema de conectividade - Verifique sua internet');
    } else if (error.response?.status === 401) {
      console.log('❌ Credenciais inválidas - Verifique CLIENT_ID e CLIENT_SECRET');
    } else if (error.response?.status === 403) {
      console.log('❌ Acesso negado - Verifique permissões da conta Pluggy');
    } else {
      console.log('❌ Erro desconhecido - Verifique logs acima');
    }
  }
}

// Executar teste
testPluggyConnection();