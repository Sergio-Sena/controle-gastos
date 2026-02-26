require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const aiRoutes = require('./routes/ai');
const pluggyRoutes = require('./routes/pluggy');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pluggy', pluggyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartFinance API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));
