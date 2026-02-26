const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// CREATE - Criar transação
router.post('/', auth, async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.userId });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ - Listar transações do usuário
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Buscar transação por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Atualizar transação
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Deletar transação
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!transaction) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;