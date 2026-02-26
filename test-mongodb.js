const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://smartfinance-admin:jiSzmr71Pwjyq3TH@cluster0.lffeywq.mongodb.net/smartfinance?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("✅ CONEXÃO MONGODB OK!");
    
    const databases = await client.db().admin().listDatabases();
    console.log("📊 Databases:", databases.databases.map(db => db.name));
    
  } catch (error) {
    console.error("❌ ERRO:", error.message);
  } finally {
    await client.close();
  }
}

testConnection();
