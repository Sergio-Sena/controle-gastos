import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      padding: 'clamp(1rem, 5vw, 2rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: 'clamp(0.5rem, 2vw, 1rem)', 
        right: 'clamp(0.5rem, 2vw, 1rem)', 
        zIndex: 10 
      }}>
        <ThemeToggle />
      </div>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
          <h1 className="gradient-text" style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', 
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}>
            SmartFinance
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)'
          }}>
            Seu assistente financeiro inteligente
          </p>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(1rem, 3vw, 2rem)',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setIsLogin(true)}
            style={{ 
              padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)', 
              background: isLogin ? 'var(--gradient-primary)' : 'transparent',
              color: isLogin ? 'white' : 'var(--text-primary)',
              border: isLogin ? 'none' : '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              fontWeight: '600',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              minWidth: '120px'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            style={{ 
              padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
              background: !isLogin ? 'var(--gradient-success)' : 'transparent',
              color: !isLogin ? 'white' : 'var(--text-primary)',
              border: !isLogin ? 'none' : '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              fontWeight: '600',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              minWidth: '120px'
            }}
          >
            Criar Conta
          </button>
        </div>
        
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: 'var(--text-secondary)' }}>Carregando...</div>
        </div>
      </div>
    );
  }

  return user ? (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ) : (
    <AuthPage />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
