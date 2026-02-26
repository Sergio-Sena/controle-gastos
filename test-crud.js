// Testes CRUD - Transações
// Primeiro faça login para obter o token

const BASE_URL = 'http://localhost:3000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OWY4N2QyODY2MGNjMzU4MjY1ZTJlYiIsImlhdCI6MTc3MjA2MjY3NCwiZXhwIjoxNzcyNjY3NDc0fQ.d8RGwy_4UrcyVqteaVV8iSxzq3s-aTvfWRvka2vlkSo';

// 1. CREATE - Criar transação
async function createTransaction() {
  const transaction = {
    type: 'despesa',
    description: 'Supermercado',
    amount: 150.50,
    category: 'Alimentação',
    date: new Date(),
    isRecurring: false
  };

  const response = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(transaction)
  });

  const data = await response.json();
  console.log('✅ CREATE:', data);
  return data._id; // Retorna ID para outros testes
}

// 2. READ - Listar todas as transações
async function getTransactions() {
  const response = await fetch(`${BASE_URL}/transactions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  console.log('📋 READ ALL:', data);
}

// 3. READ - Buscar transação por ID
async function getTransaction(id) {
  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  console.log('🔍 READ ONE:', data);
}

// 4. UPDATE - Atualizar transação
async function updateTransaction(id) {
  const updates = {
    description: 'Supermercado - Atualizado',
    amount: 200.00
  };

  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();
  console.log('✏️ UPDATE:', data);
}

// 5. DELETE - Deletar transação
async function deleteTransaction(id) {
  const response = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  console.log('🗑️ DELETE:', data);
}

// Executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes CRUD...\n');
  
  const transactionId = await createTransaction();
  await getTransactions();
  await getTransaction(transactionId);
  await updateTransaction(transactionId);
  await deleteTransaction(transactionId);
  
  console.log('\n✅ Testes concluídos!');
}

// Executar testes
runTests();