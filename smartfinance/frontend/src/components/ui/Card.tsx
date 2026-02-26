import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  hover = false,
  glass = false
}) => {
  return (
    <div
      className={`${glass ? 'glass' : ''} ${hover ? 'hover-lift' : ''} ${className}`}
      style={{
        background: glass ? 'var(--glass-bg)' : 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-base)',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Card;
