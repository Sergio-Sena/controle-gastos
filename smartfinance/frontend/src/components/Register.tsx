import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, User, Mail, Lock, UserPlus, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Validações
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email === '' || emailRegex.test(email);
  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== '';
  const canSubmit = name && email && isEmailValid && password.length >= 6 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) {
      setError('Por favor, preencha todos os campos corretamente');
      return;
    }
    
    if (!passwordsMatch) {
      setError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await register({ name, email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
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
          <Sparkles size={48} style={{ color: 'var(--success-500)' }} />
        </div>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.75rem', 
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Crie sua conta
        </h2>
        <p style={{ 
          margin: 0, 
          color: 'var(--text-secondary)',
          fontSize: '0.95rem'
        }}>
          Comece a controlar suas finanças hoje
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
            <User size={16} /> Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Seu nome"
            autoComplete="name"
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
            onFocus={(e) => e.target.style.borderColor = 'var(--success-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
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
            onFocus={(e) => e.target.style.borderColor = email && !isEmailValid ? 'var(--error-500)' : 'var(--success-500)'}
            onBlur={(e) => e.target.style.borderColor = email && !isEmailValid ? 'var(--error-500)' : 'var(--border-color)'}
          />
          {email && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
              {isEmailValid ? (
                <><CheckCircle size={14} style={{ color: 'var(--success-500)' }} /> <span style={{ color: 'var(--success-500)' }}>Email válido</span></>
              ) : (
                <><XCircle size={14} style={{ color: 'var(--error-500)' }} /> <span style={{ color: 'var(--error-500)' }}>Email inválido</span></>
              )}
            </div>
          )}
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
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1rem',
              border: `2px solid ${password && password.length < 6 ? 'var(--error-500)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-base)',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = password && password.length < 6 ? 'var(--error-500)' : 'var(--success-500)'}
            onBlur={(e) => e.target.style.borderColor = password && password.length < 6 ? 'var(--error-500)' : 'var(--border-color)'}
          />
          {password && (
            <div style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {password.length >= 6 ? <CheckCircle size={12} style={{ color: 'var(--success-500)' }} /> : <XCircle size={12} style={{ color: 'var(--error-500)' }} />}
                <span style={{ color: password.length >= 6 ? 'var(--success-500)' : 'var(--text-secondary)' }}>Mínimo 6 caracteres</span>
              </div>
              {isPasswordStrong ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-500)' }}>
                  <CheckCircle size={12} /> Senha forte!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)' }}>
                  <AlertCircle size={12} /> Recomendado: 8+ caracteres, 1 maiúscula, 1 número
                </div>
              )}
            </div>
          )}
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
            <Lock size={16} /> Confirmar Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              fontSize: '1rem',
              border: `2px solid ${confirmPassword && !passwordsMatch ? 'var(--error-500)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-base)',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = confirmPassword && !passwordsMatch ? 'var(--error-500)' : 'var(--success-500)'}
            onBlur={(e) => e.target.style.borderColor = confirmPassword && !passwordsMatch ? 'var(--error-500)' : 'var(--border-color)'}
          />
          {confirmPassword && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
              {passwordsMatch ? (
                <><CheckCircle size={14} style={{ color: 'var(--success-500)' }} /> <span style={{ color: 'var(--success-500)' }}>Senhas coincidem</span></>
              ) : (
                <><XCircle size={14} style={{ color: 'var(--error-500)' }} /> <span style={{ color: 'var(--error-500)' }}>Senhas não coincidem</span></>
              )}
            </div>
          )}
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
            background: (isLoading || !canSubmit) ? 'var(--neutral-400)' : 'var(--success-500)',
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
              e.currentTarget.style.background = 'var(--success-700)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && canSubmit) {
              e.currentTarget.style.background = 'var(--success-500)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Criar Conta
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

export default Register;
