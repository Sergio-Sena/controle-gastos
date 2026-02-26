const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// GET /api/ai/analyze - Análise IA das transações
router.get('/analyze', auth, async (req, res) => {
  try {
    console.log('Iniciando análise IA para usuário:', req.userId);
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(50);

    console.log('Transações encontradas:', transactions.length);
    
    const analysis = await aiService.analyzeTransactions(transactions);
    
    console.log('Análise concluída:', analysis);
    
    res.json({
      success: true,
      analysis,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Erro na análise:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

module.exports = router;