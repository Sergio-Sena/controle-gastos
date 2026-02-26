const express = require('express');
const router = express.Router();
const pluggyService = require('../services/pluggyService');
const pluggySimulator = require('../services/pluggySimulator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Flag para usar simulador quando API real falha
const USE_SIMULATOR = process.env.PLUGGY_USE_SIMULATOR === 'true';
const PREFER_REAL_API = process.env.PLUGGY_PREFER_REAL !== 'false'; // Default: true

// Função helper para escolher serviço
const getPluggyService = () => {
  if (USE_SIMULATOR) return pluggySimulator;
  return PREFER_REAL_API ? pluggyService : pluggySimulator;
};

// GET /api/pluggy/connect-token - Gerar token de conexão
router.get('/connect-token', auth, async (req, res) => {
  try {
    console.log('🔑 Gerando connect token para usuário:', req.userId);
    const service = getPluggyService();
    const connectToken = await service.createConnectToken(req.userId);
    console.log('✅ Connect token gerado com sucesso');
    res.json({ connectToken });
  } catch (error) {
    console.error('❌ Erro ao gerar connect token:', error.message);
    // Fallback para simulador em caso de erro
    try {
      const connectToken = await pluggySimulator.createConnectToken(req.userId);
      console.log('🔄 Usando simulador como fallback');
      res.json({ connectToken });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Erro interno do servidor', details: fallbackError.message });
    }
  }
});

// GET /api/pluggy/connectors - Listar bancos disponíveis
router.get('/connectors', auth, async (req, res) => {
  try {
    console.log('🏦 Buscando conectores...');
    const service = getPluggyService();
    const connectors = await service.getConnectors();
    console.log(`✅ ${connectors.length} conectores encontrados`);
    res.json({ connectors });
  } catch (error) {
    console.error('❌ Erro ao buscar conectores:', error.message);
    // Se for rate limit, usar simulador imediatamente
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limit detectado, usando simulador');
      const connectors = await pluggySimulator.getConnectors();
      return res.json({ connectors, usingSimulator: true });
    }
    // Fallback para simulador em caso de erro
    try {
      const connectors = await pluggySimulator.getConnectors();
      console.log(`🔄 Usando simulador: ${connectors.length} conectores`);
      res.json({ connectors });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Erro interno do servidor', details: fallbackError.message });
    }
  }
});

// GET /api/pluggy/items - Listar conexões do usuário
router.get('/items', auth, async (req, res) => {
  try {
    console.log('📋 Buscando items para usuário:', req.userId);
    const service = getPluggyService();
    const items = await service.getItems(req.userId);
    console.log(`✅ ${items.length} items encontrados`);
    res.json({ items });
  } catch (error) {
    console.error('❌ Erro ao buscar items:', error.message);
    // Se for rate limit, usar simulador imediatamente
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limit detectado, usando simulador');
      const items = await pluggySimulator.getItems(req.userId);
      return res.json({ items, usingSimulator: true });
    }
    // Fallback para simulador em caso de erro
    try {
      const items = await pluggySimulator.getItems(req.userId);
      console.log(`🔄 Usando simulador: ${items.length} items`);
      res.json({ items });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Erro interno do servidor', details: fallbackError.message });
    }
  }
});

// GET /api/pluggy/accounts/:itemId - Listar contas de um item
router.get('/accounts/:itemId', auth, async (req, res) => {
  try {
    const service = getPluggyService();
    const accounts = await service.getAccounts(req.params.itemId);
    res.json({ accounts });
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    // Fallback para simulador
    try {
      const accounts = await pluggySimulator.getAccounts(req.params.itemId);
      res.json({ accounts });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// POST /api/pluggy/connect - Conectar banco (simulador)
router.post('/connect', auth, async (req, res) => {
  try {
    const { connectorId } = req.body;
    console.log(`🔗 Conectando banco ${connectorId} para usuário:`, req.userId);
    
    // Usar sempre o simulador para conexão
    const item = await pluggySimulator.createItem(req.userId, connectorId);
    console.log('✅ Banco conectado com sucesso:', item.id);
    res.json({ item });
  } catch (error) {
    console.error('❌ Erro ao conectar banco:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao conectar banco', details: error.message });
  }
});

// POST /api/pluggy/sync-transactions - Sincronizar transações
router.post('/sync-transactions', auth, async (req, res) => {
  try {
    const { itemId, accountId, days = 30 } = req.body;
    
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const service = getPluggyService();
    let pluggyTransactions;
    
    try {
      pluggyTransactions = await service.getTransactions(
        accountId, 
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      );
    } catch (error) {
      // Fallback para simulador
      pluggyTransactions = await pluggySimulator.getTransactions(
        accountId,
        fromDate.toISOString().split('T')[0],
        toDate.toISOString().split('T')[0]
      );
    }
    
    let importedCount = 0;
    
    for (const pluggyTx of pluggyTransactions) {
      // Verificar se já existe
      const existing = await Transaction.findOne({
        userId: req.userId,
        pluggyId: pluggyTx.id
      });
      
      if (!existing) {
        const formattedTx = service.formatTransaction ? 
          service.formatTransaction(pluggyTx) : 
          pluggySimulator.formatTransaction(pluggyTx);
        await Transaction.create({
          ...formattedTx,
          userId: req.userId
        });
        importedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      imported: importedCount,
      total: pluggyTransactions.length 
    });
  } catch (error) {
    console.error('Erro ao sincronizar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/pluggy/items/:itemId - Desconectar banco
router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const service = getPluggyService();
    await service.deleteItem(req.params.itemId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    // Fallback para simulador
    try {
      await pluggySimulator.deleteItem(req.params.itemId);
      res.json({ success: true });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;