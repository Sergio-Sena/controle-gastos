import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Mail, Lock, LogIn, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Validações
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email === '' || emailRegex.test(email);
  const canSubmit = email && isEmailValid && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{
      width: '100%',
      padding: 'clamp(1.5rem, 4vw, 2.5rem)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <TrendingUp size={48} style={{ color: 'var(--primary-500)' }} />
        </div>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.75rem', 
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Bem-vindo de volta
        </h2>
        <p style={{ 
          margin: 0, 
          color: 'var(--text-secondary)',
          fontSize: '0.95rem'
        }}>
          Entre para gerenciar suas finanças
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Mail size={16} /> Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1rem',
              border: `2px solid ${email && !isEmailValid ? 'var(--error-500)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-base)',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = email && !isEmailValid ? 'var(--error-500)' : 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = email && !isEmailValid ? 'var(--error-500)' : 'var(--border-color)'}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: '500',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Lock size={16} /> Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1rem',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-base)',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            background: 'var(--error-50)',
            border: '1px solid var(--error-500)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error-700)',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            background: (isLoading || !canSubmit) ? 'var(--neutral-400)' : 'var(--primary-500)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: (isLoading || !canSubmit) ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-base)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: !canSubmit ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading && canSubmit) {
              e.currentTarget.style.background = 'var(--primary-600)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && canSubmit) {
              e.currentTarget.style.background = 'var(--primary-500)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn size={16} />
              Entrar
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
