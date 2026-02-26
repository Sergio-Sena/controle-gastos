const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['receita', 'despesa'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    required: function() { return this.type === 'despesa'; }
  },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  pluggyId: { type: String }, // ID da transação no Pluggy
  accountId: { type: String }, // ID da conta no Pluggy
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);