import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all var(--transition-base)',
        color: 'var(--text-primary)'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span>{theme === 'light' ? 'Escuro' : 'Claro'}</span>
    </button>
  );
};

export default ThemeToggle;
