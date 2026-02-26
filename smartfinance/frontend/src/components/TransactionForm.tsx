import React, { useState } from 'react';
import { transactionAPI } from '../services/transactions';
import { Modal, Button } from './ui';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'despesa',
    category: 'Outros',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação',
    'Lazer', 'Compras', 'Contas', 'Investimentos', 'Outros'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await transactionAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      setFormData({
        description: '',
        amount: '',
        type: 'despesa',
        category: 'Outros',
        date: new Date().toISOString().split('T')[0]
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar transação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💰 Nova Transação">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tipo */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Tipo
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'receita' })}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: formData.type === 'receita' ? 'var(--success-500)' : 'var(--bg-secondary)',
                  color: formData.type === 'receita' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all var(--transition-base)'
                }}
              >
                💵 Receita
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'despesa' })}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: formData.type === 'despesa' ? 'var(--error-500)' : 'var(--bg-secondary)',
                  color: formData.type === 'despesa' ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all var(--transition-base)'
                }}
              >
                💸 Despesa
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Ex: Supermercado, Salário..."
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                transition: 'border-color var(--transition-base)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
            />
          </div>

          {/* Valor */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0,00"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                transition: 'border-color var(--transition-base)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
            />
          </div>

          {/* Categoria */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'var(--error-50)',
              border: '1px solid var(--error-500)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error-700)',
              fontSize: 'var(--text-sm)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={formData.type === 'receita' ? 'success' : 'primary'}
              isLoading={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;
