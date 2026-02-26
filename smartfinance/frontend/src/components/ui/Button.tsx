import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  style = {},
  ...props
}) => {
  const variants = {
    primary: {
      background: 'var(--gradient-primary)',
      color: 'white',
      border: 'none',
      hover: 'var(--primary-600)'
    },
    secondary: {
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      hover: 'var(--bg-tertiary)'
    },
    success: {
      background: 'var(--gradient-success)',
      color: 'white',
      border: 'none',
      hover: 'var(--success-600)'
    },
    danger: {
      background: 'var(--error-500)',
      color: 'white',
      border: 'none',
      hover: 'var(--error-600)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid transparent',
      hover: 'var(--bg-secondary)'
    }
  };

  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: 'var(--text-sm)' },
    md: { padding: '0.75rem 1.5rem', fontSize: 'var(--text-base)' },
    lg: { padding: '1rem 2rem', fontSize: 'var(--text-lg)' }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`transition hover-lift ${className}`}
      style={{
        ...sizeStyle,
        background: variantStyle.background,
        color: variantStyle.color,
        border: variantStyle.border,
        borderRadius: 'var(--radius-lg)',
        fontWeight: '600',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style
      }}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
