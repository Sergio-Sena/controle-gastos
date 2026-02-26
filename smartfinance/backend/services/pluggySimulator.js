// Simulador Pluggy para desenvolvimento
class PluggySimulator {
  constructor() {
    this.mockConnectors = [
      { id: 'itau', name: 'Itaú', type: 'PERSONAL_BANK', country: 'BR', imageUrl: 'https://cdn.pluggy.ai/assets/connector/itau.png' },
      { id: 'bradesco', name: 'Bradesco', type: 'PERSONAL_BANK', country: 'BR', imageUrl: 'https://cdn.pluggy.ai/assets/connector/bradesco.png' },
      { id: 'santander', name: 'Santander', type: 'PERSONAL_BANK', country: 'BR', imageUrl: 'https://cdn.pluggy.ai/assets/connector/santander.png' },
      { id: 'bb', name: 'Banco do Brasil', type: 'PERSONAL_BANK', country: 'BR', imageUrl: 'https://cdn.pluggy.ai/assets/connector/bb.png' },
      { id: 'caixa', name: 'Caixa Econômica', type: 'PERSONAL_BANK', country: 'BR', imageUrl: 'https://cdn.pluggy.ai/assets/connector/caixa.png' }
    ];

    this.mockItems = [];
    this.mockAccounts = [];
    this.mockTransactions = [];
  }

  async createConnectToken(userId) {
    return `mock_connect_token_${userId}_${Date.now()}`;
  }

  async getConnectors() {
    return this.mockConnectors;
  }

  async getItems(userId) {
    return this.mockItems.filter(item => item.clientUserId === userId.toString());
  }

  async createItem(userId, connectorId) {
    // Aceitar qualquer connectorId e criar um conector genérico se não existir
    let connector = this.mockConnectors.find(c => c.id == connectorId);
    
    if (!connector) {
      // Criar conector genérico para IDs não encontrados
      connector = {
        id: connectorId,
        name: `Banco ${connectorId}`,
        type: 'PERSONAL_BANK',
        country: 'BR',
        imageUrl: ''
      };
      console.log('🏛️ Criando conector genérico:', connector.name);
    }

    const item = {
      id: `item_${Date.now()}`,
      connector: connector,
      clientUserId: userId.toString(),
      status: 'UPDATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockItems.push(item);

    // Criar conta mock
    const account = {
      id: `account_${Date.now()}`,
      itemId: item.id,
      type: 'BANK',
      subtype: 'CHECKING_ACCOUNT',
      name: `Conta Corrente ${connector.name}`,
      balance: Math.random() * 10000,
      currencyCode: 'BRL'
    };

    this.mockAccounts.push(account);

    // Criar transações mock
    this.generateMockTransactions(account.id);

    return item;
  }

  async getAccounts(itemId) {
    return this.mockAccounts.filter(account => account.itemId === itemId);
  }

  async getTransactions(accountId, from = null, to = null) {
    let transactions = this.mockTransactions.filter(tx => tx.accountId === accountId);
    
    if (from) {
      transactions = transactions.filter(tx => tx.date >= from);
    }
    if (to) {
      transactions = transactions.filter(tx => tx.date <= to);
    }

    return transactions;
  }

  generateMockTransactions(accountId) {
    const categories = [
      { name: 'Supermercado Extra', amount: -150.50, category: 'Alimentação' },
      { name: 'Posto Shell', amount: -80.00, category: 'Transporte' },
      { name: 'Farmácia Droga Raia', amount: -45.30, category: 'Saúde' },
      { name: 'Salário', amount: 3500.00, category: 'Receita' },
      { name: 'Netflix', amount: -29.90, category: 'Lazer' },
      { name: 'Conta de Luz', amount: -120.00, category: 'Casa' },
      { name: 'Restaurante', amount: -65.00, category: 'Alimentação' },
      { name: 'Uber', amount: -25.50, category: 'Transporte' }
    ];

    for (let i = 0; i < 20; i++) {
      const mockTx = categories[Math.floor(Math.random() * categories.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const transaction = {
        id: `tx_${Date.now()}_${i}`,
        accountId: accountId,
        description: mockTx.name,
        amount: mockTx.amount,
        date: date.toISOString().split('T')[0],
        category: mockTx.category,
        type: mockTx.amount > 0 ? 'CREDIT' : 'DEBIT'
      };

      this.mockTransactions.push(transaction);
    }
  }

  async deleteItem(itemId) {
    this.mockItems = this.mockItems.filter(item => item.id !== itemId);
    this.mockAccounts = this.mockAccounts.filter(account => account.itemId !== itemId);
    this.mockTransactions = this.mockTransactions.filter(tx => 
      !this.mockAccounts.some(acc => acc.id === tx.accountId && acc.itemId === itemId)
    );
    return true;
  }

  formatTransaction(pluggyTransaction) {
    return {
      description: pluggyTransaction.description || 'Transação bancária',
      amount: Math.abs(pluggyTransaction.amount),
      type: pluggyTransaction.amount >= 0 ? 'receita' : 'despesa',
      date: pluggyTransaction.date,
      category: pluggyTransaction.category || 'Outros',
      pluggyId: pluggyTransaction.id,
      accountId: pluggyTransaction.accountId
    };
  }
}

module.exports = new PluggySimulator();