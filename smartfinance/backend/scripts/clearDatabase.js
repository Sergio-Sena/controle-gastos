require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
    
    const usersResult = await User.deleteMany({});
    console.log(`🗑️  ${usersResult.deletedCount} usuários removidos`);
    
    const transactionsResult = await Transaction.deleteMany({});
    console.log(`🗑️  ${transactionsResult.deletedCount} transações removidas`);

    await mongoose.connection.close();
    console.log('✅ Banco de dados completamente limpo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

clearDatabase();
