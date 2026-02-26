require('dotenv').config();
const mongoose = require('mongoose');

const clearTransactions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
    
    const result = await Transaction.deleteMany({});
    console.log(`🗑️  ${result.deletedCount} transações removidas`);

    await mongoose.connection.close();
    console.log('✅ Banco de dados limpo com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

clearTransactions();
