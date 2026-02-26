const axios = require('axios');
require('dotenv').config();

class PluggyService {
  constructor() {
    this.baseURL = process.env.PLUGGY_BASE_URL || 'https://api.pluggy.ai';
    this.clientId = process.env.PLUGGY_CLIENT_ID;
    this.clientSecret = process.env.PLUGGY_CLIENT_SECRET;
    this.accessToken = null;
  }

  async authenticate() {
    try {
      console.log('🔐 Tentando autenticar com Pluggy...');
      console.log('Client ID:', this.clientId ? 'Configurado' : 'NÃO CONFIGURADO');
      console.log('Client Secret:', this.clientSecret ? 'Configurado' : 'NÃO CONFIGURADO');
      
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Credenciais Pluggy não configuradas');
      }
      
      const response = await axios.post(`${this.baseURL}/auth`, {
        clientId: this.clientId,
        clientSecret: this.clientSecret
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmartFinance/1.0'
        }
      });
      
      this.accessToken = response.data.apiKey || response.data.accessToken;
      console.log('✅ Autenticação Pluggy bem-sucedida');
      console.log('Token:', this.accessToken ? 'Recebido' : 'NÃO RECEBIDO');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Erro na autenticação Pluggy:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async makeRequest(method, endpoint, data = null, retries = 3) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'X-API-KEY': this.accessToken,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      };

      if (data) {
        config.data = data;
      }

      console.log(`🌐 ${method} ${endpoint}`);
      const response = await axios(config);
      return response.data;
    } catch (error) {
      // Token expirado
      if (error.response?.status === 401) {
        console.log('🔄 Token expirado, reautenticando...');
        this.accessToken = null;
        await this.authenticate();
        return this.makeRequest(method, endpoint, data, retries);
      }
      
      // Rate limit - aguardar e tentar novamente
      if (error.response?.status === 429 && retries > 0) {
        const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
        console.log(`⏳ Rate limit atingido. Aguardando ${retryAfter}s... (tentativas restantes: ${retries})`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest(method, endpoint, data, retries - 1);
      }
      
      console.error(`❌ Erro na requisição ${method} ${endpoint}:`, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async createConnectToken(userId) {
    try {
      const response = await this.makeRequest('POST', '/connect_token', {
        clientUserId: userId.toString()
      });
      return response.accessToken;
    } catch (error) {
      console.error('Erro ao criar connect token:', error);
      throw error;
    }
  }

  async getConnectors() {
    try {
      const response = await this.makeRequest('GET', '/connectors');
      return response.results.filter(connector => 
        connector.country === 'BR' && 
        connector.type === 'PERSONAL_BANK'
      );
    } catch (error) {
      console.error('Erro ao buscar conectores:', error);
      throw error;
    }
  }

  async getItems(userId) {
    try {
      const response = await this.makeRequest('GET', `/items?clientUserId=${userId}`);
      return response.results;
    } catch (error) {
      console.error('Erro ao buscar items:', error);
      throw error;
    }
  }

  async getAccounts(itemId) {
    try {
      const response = await this.makeRequest('GET', `/accounts?itemId=${itemId}`);
      return response.results;
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw error;
    }
  }

  async getTransactions(accountId, from = null, to = null) {
    try {
      let url = `/transactions?accountId=${accountId}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      
      const response = await this.makeRequest('GET', url);
      return response.results;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  async deleteItem(itemId) {
    try {
      await this.makeRequest('DELETE', `/items/${itemId}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  }

  formatTransaction(pluggyTransaction) {
    return {
      description: pluggyTransaction.description || 'Transação bancária',
      amount: Math.abs(pluggyTransaction.amount),
      type: pluggyTransaction.amount >= 0 ? 'receita' : 'despesa',
      date: pluggyTransaction.date,
      category: this.categorizeTransaction(pluggyTransaction.description),
      pluggyId: pluggyTransaction.id,
      accountId: pluggyTransaction.accountId
    };
  }

  categorizeTransaction(description) {
    if (!description) return 'Outros';
    
    const desc = description.toLowerCase();
    
    if (desc.includes('pix') || desc.includes('ted') || desc.includes('doc')) return 'Transferência';
    if (desc.includes('supermercado') || desc.includes('mercado')) return 'Alimentação';
    if (desc.includes('posto') || desc.includes('combustivel')) return 'Transporte';
    if (desc.includes('farmacia') || desc.includes('hospital')) return 'Saúde';
    if (desc.includes('restaurante') || desc.includes('lanchonete')) return 'Alimentação';
    if (desc.includes('shopping') || desc.includes('loja')) return 'Compras';
    
    return 'Outros';
  }
}

module.exports = new PluggyService();