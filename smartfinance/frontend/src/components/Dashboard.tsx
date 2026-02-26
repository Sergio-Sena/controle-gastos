import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI } from '../services/transactions';
import { pluggyAPI } from '../services/pluggy';
import { Card, Button, Modal } from './ui';
import ThemeToggle from './ThemeToggle';
import FinanceChart from './FinanceChart';
import TransactionForm from './TransactionForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [categoryData, setCategoryData] = useState({ labels: [], values: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingBanks, setLoadingBanks] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await transactionAPI.getAll();
      setTransactions(data);
      
      const receitas = data.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
      const despesas = data.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
      setSummary({ receitas, despesas, saldo: receitas - despesas });
      
      // Calcular gastos por categoria
      const categories = {};
      data.filter(t => t.type === 'despesa').forEach(t => {
        const cat = t.category || 'Outros';
        categories[cat] = (categories[cat] || 0) + t.amount;
      });
      
      const sortedCategories = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);
      
      setCategoryData({
        labels: sortedCategories.map(([cat]) => cat),
        values: sortedCategories.map(([, val]) => val)
      });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const data = await pluggyAPI.getConnectors();
      const popularBanks = ['Nubank', 'Inter', 'C6 Bank', 'Banco do Brasil', 'Bradesco', 'Itaú', 'Santander', 'Caixa'];
      const sorted = (data.connectors || []).sort((a, b) => {
        const aIndex = popularBanks.findIndex(bank => a.name.toLowerCase().includes(bank.toLowerCase()));
        const bIndex = popularBanks.findIndex(bank => b.name.toLowerCase().includes(bank.toLowerCase()));
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
      setBanks(sorted);
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleOpenBankModal = () => {
    setShowBankModal(true);
    if (banks.length === 0) {
      loadBanks();
    }
  };

  const handleConnectBank = async (bank) => {
    alert(`Conectando com ${bank.name}...`);
    setShowBankModal(false);
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div className="animate-pulse" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <div className="gradient-text" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      position: 'relative'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 className="gradient-text" style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              margin: 0,
              fontWeight: 'bold'
            }}>
              💰 SmartFinance
            </h1>
            <p style={{ 
              margin: 0, 
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              Olá, {user?.name}!
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout}>
              🚪 Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ 
        padding: 'clamp(1rem, 3vw, 2rem)',
        paddingTop: 'clamp(1.5rem, 4vw, 3rem)'
      }}>
        {/* Summary Cards */}
        <div className="grid grid-cols-3" style={{ 
          marginBottom: 'clamp(1.5rem, 4vw, 3rem)',
          gap: 'clamp(1rem, 2vw, 1.5rem)'
        }}>
          <Card glass hover className="stagger-item">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: 'var(--text-sm)',
                marginBottom: '0.5rem'
              }}>
                Receitas
              </p>
              <p className="glow-success" style={{ 
                margin: 0, 
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
                fontWeight: 'bold',
                color: 'var(--success-text)'
              }}>
                {formatCurrency(summary.receitas)}
              </p>
            </div>
          </Card>

          <Card glass hover className="stagger-item" style={{ animationDelay: '100ms' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: 'var(--text-sm)',
                marginBottom: '0.5rem'
              }}>
                Despesas
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
                fontWeight: 'bold',
                color: 'var(--error-text)'
              }}>
                {formatCurrency(summary.despesas)}
              </p>
            </div>
          </Card>

          <Card glass hover className="stagger-item" style={{ animationDelay: '200ms' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {summary.saldo >= 0 ? '✅' : '⚠️'}
              </div>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)', 
                fontSize: 'var(--text-sm)',
                marginBottom: '0.5rem'
              }}>
                Saldo
              </p>
              <p className={summary.saldo >= 0 ? 'glow-success' : ''} style={{ 
                margin: 0, 
                fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
                fontWeight: 'bold',
                color: summary.saldo >= 0 ? 'var(--success-text)' : 'var(--error-text)'
              }}>
                {formatCurrency(summary.saldo)}
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Transactions & Open Finance */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(1.5rem, 4vw, 3rem)'
        }}>
          <Card glass className="stagger-item" style={{ animationDelay: '300ms' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 'bold'
              }}>
                📊 Transações
              </h2>
              <Button variant="primary" size="sm" onClick={() => setShowTransactionModal(true)}>
                + Nova
              </Button>
            </div>

            {transactions.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                <p style={{ margin: 0 }}>Nenhuma transação ainda</p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {transactions.slice(0, 10).map((transaction) => (
                  <div 
                    key={transaction._id}
                    style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>
                        {transaction.description}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: transaction.type === 'receita' ? 'var(--success-text)' : 'var(--error-text)'
                    }}>
                      {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card glass className="stagger-item" style={{ animationDelay: '400ms' }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 'bold'
            }}>
              🏦 Open Finance
            </h2>
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem 1rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
              <p style={{ margin: '0 0 1rem 0' }}>
                Conecte seus bancos para importar transações automaticamente
              </p>
              <Button variant="primary" size="md" onClick={handleOpenBankModal}>
                🏦 Conectar Banco
              </Button>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        {categoryData.labels.length > 0 && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)'
          }}>
            <Card glass className="stagger-item" style={{ animationDelay: '500ms' }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 'bold'
              }}>
                📊 Gastos por Categoria
              </h2>
              <FinanceChart data={categoryData} type="bar" title="Gastos por Categoria" />
            </Card>

            <Card glass className="stagger-item" style={{ animationDelay: '600ms' }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 'bold'
              }}>
                🥧 Distribuição de Gastos
              </h2>
              <FinanceChart data={categoryData} type="pie" title="Distribuição" />
            </Card>
          </div>
        )}
      </main>

      {/* Modal de Bancos */}
      <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="🏦 Conectar Banco">
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Buscar banco (ex: Nubank, Inter, Itaú...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: 'var(--text-base)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color var(--transition-base)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
          />
          <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {filteredBanks.length} banco(s) encontrado(s)
          </p>
        </div>

        {loadingBanks ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="animate-spin" style={{ 
              display: 'inline-block',
              width: '3rem',
              height: '3rem',
              border: '4px solid var(--border-primary)',
              borderTopColor: 'var(--primary-500)',
              borderRadius: '50%'
            }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando bancos...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '0.75rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleConnectBank(bank)}
                className="hover-lift"
                style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: '500'
                }}
              >
                {bank.name}
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal de Nova Transação */}
      <TransactionForm
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={loadTransactions}
      />
    </div>
  );
};

export default Dashboard;
