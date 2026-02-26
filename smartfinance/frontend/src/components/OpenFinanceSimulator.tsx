import React, { useState, useEffect } from 'react';
import { pluggyAPI } from '../services/pluggy';

const PluggyConnector = ({ onTransactionsImported }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectors, setConnectors] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');

  const popularBanks = [
    'Nubank', 'Inter', 'C6 Bank', 'Banco do Brasil', 'Bradesco', 
    'Itaú', 'Santander', 'Caixa', 'Sicoob', 'Sicredi',
    'BTG Pactual', 'Original', 'Safra', 'PagBank', 'Mercado Pago'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('🔍 Carregando dados Pluggy...');
      const [connectorsData, itemsData] = await Promise.all([
        pluggyAPI.getConnectors().catch(err => {
          console.error('Erro conectores:', err);
          return { connectors: [] };
        }),
        pluggyAPI.getItems().catch(err => {
          console.error('Erro items:', err);
          return { items: [] };
        })
      ]);
      
      console.log('📊 Conectores:', connectorsData.connectors?.length || 0);
      console.log('🏦 Items:', itemsData.items?.length || 0);
      
      const sortedConnectors = (connectorsData.connectors || []).sort((a, b) => {
        const aIndex = popularBanks.findIndex(bank => a.name.toLowerCase().includes(bank.toLowerCase()));
        const bIndex = popularBanks.findIndex(bank => b.name.toLowerCase().includes(bank.toLowerCase()));
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setConnectors(sortedConnectors);
      setItems(itemsData.items || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setConnectors([
        { id: 6, name: 'Nubank', imageUrl: '', country: 'BR' },
        { id: 7, name: 'Inter', imageUrl: '', country: 'BR' },
        { id: 8, name: 'C6 Bank', imageUrl: '', country: 'BR' }
      ]);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBank = async (connector) => {
    console.log('🔗 Conectando:', connector.name);
    setIsConnecting(true);
    setSelectedConnector(connector);
    
    try {
      const tokenData = await pluggyAPI.getConnectToken();
      const token = tokenData.connectToken;
      
      console.log('✅ Token obtido:', token?.substring(0, 20) + '...');
      
      // URL correta do Pluggy Connect
      const url = `https://connect.pluggy.ai?connectToken=${encodeURIComponent(token)}&connectorId=${connector.id}`;
      
      console.log('🌐 Abrindo:', url.substring(0, 80) + '...');
      
      const popup = window.open(url, 'PluggyConnect', 'width=500,height=700,scrollbars=yes');
      
      if (!popup) {
        throw new Error('Popup bloqueado. Permita popups para este site.');
      }
      
      // Aguardar fechamento do popup
      const checkPopup = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkPopup);
          console.log('✅ Popup fechado, recarregando dados...');
          await loadInitialData();
          setIsConnecting(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Erro:', error);
      alert(`❌ ${error.message}`);
      setIsConnecting(false);
    }
  };

  const syncTransactions = async (item) => {
    try {
      const accountsData = await pluggyAPI.getAccounts(item.id);
      const accounts = accountsData.accounts;
      
      if (accounts.length === 0) {
        alert('Nenhuma conta encontrada');
        return;
      }
      
      const account = accounts[0];
      const result = await pluggyAPI.syncTransactions({
        itemId: item.id,
        accountId: account.id,
        days: 30
      });
      
      alert(`${result.imported} transações importadas de ${result.total} encontradas`);
      onTransactionsImported?.();
      
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar transações');
    }
  };

  const disconnectBank = async (itemId) => {
    if (confirm('Desconectar este banco?')) {
      try {
        await pluggyAPI.deleteItem(itemId);
        loadInitialData();
        alert('Banco desconectado com sucesso');
      } catch (error) {
        console.error('Erro ao desconectar:', error);
        alert('Erro ao desconectar banco');
      }
    }
  };

  const filteredConnectors = connectors.filter(connector =>
    connector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Carregando bancos...</div>;
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#28a745' }}>🏦 Open Finance - Pluggy</h3>
        <span style={{ 
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '10px',
          fontWeight: 'bold'
        }}>LIVE</span>
      </div>
      
      {items.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>✅ Bancos Conectados</h4>
          {items.map(item => (
            <div key={item.id} style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{item.connector.name}</strong>
                <p><small>Status: {item.status}</small></p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => syncTransactions(item)}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  📥 Sincronizar
                </button>
                <button 
                  onClick={() => disconnectBank(item.id)}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  🔌 Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div>
        <h4>🏦 Conectar Novo Banco</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar banco..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: '2px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
            {filteredConnectors.length} banco(s) de {connectors.length} disponíveis
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {filteredConnectors.map(connector => (
            <button
              key={connector.id}
              onClick={() => handleConnectBank(connector)}
              disabled={isConnecting}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{ fontSize: '12px' }}>{connector.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PluggyConnector;
